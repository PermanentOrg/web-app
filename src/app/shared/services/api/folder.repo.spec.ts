import { TestBed } from '@angular/core/testing';
import { FolderVO } from '@models/index';
import { Observable, of } from 'rxjs';
import { ShareLink } from '@root/app/share-links/models/share-link';
import { StorageService } from '@shared/services/storage/storage.service';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { HttpService } from '../http/http.service';
import { clearDerivedStelaAccessRoleCache } from './record.repo';
import {
	clearSharesBreadcrumbPathCache,
	FolderRepo,
	FolderResponse,
} from './folder.repo';

const emptyResponse = { items: [] };
const fakeFolderResponse = {
	items: [
		{
			id: 42,
			name: 'Auth Folder',
		},
	],
};
const mockStelaFolder = {
	folderId: '123',
	size: 1024,
	location: { id: '1', name: 'Test Location' },
	parentFolder: { id: '456' },
	shares: [],
	tags: [],
	archive: { id: 'arch1', name: 'Test Archive' },
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-02T00:00:00Z',
	description: 'Test folder',
	displayName: 'Test Folder',
	downloadName: 'test-folder',
	imageRatio: 1.5,
	paths: { names: ['path1', 'path2'] },
	publicAt: null,
	sort: 'name',
	thumbnailUrls: {
		'200': 'url200',
		'256': 'url256',
		'500': 'url500',
		'1000': 'url1000',
		'2000': 'url2000',
	},
	type: 'folder',
	status: 'ok',
	view: 'grid',
};
const fakeChildrenResponse = {
	items: [
		{
			id: 300,
			name: 'Auth Child',
			thumbnailUrls: { 200: 'test' },
			paths: { names: 'test' },
			location: { stelaLocation: { id: 13 } },
		},
	],
};

const buildStelaFolderResponse = (overrides: Record<string, unknown> = {}) => ({
	items: [
		{
			folderId: '42',
			archiveNumber: 'ARCH-001',
			archive: { id: 'arch-id', name: 'Test Archive' },
			folderLinkId: 100,
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-06-01T00:00:00Z',
			description: 'Test',
			displayTimestamp: '2024-01-01T00:00:00Z',
			displayEndTimestamp: null,
			displayName: 'Test Folder',
			downloadName: 'Test Folder',
			imageRatio: 1,
			paths: {
				names: ['My Files', 'Test Folder'],
				folderLinkIds: ['55', '100'],
				archiveNumbers: ['ARCH-000', 'ARCH-001'],
			},
			publicAt: null,
			sort: null,
			thumbnailUrls: null,
			type: 'type.folder.generic',
			status: 'status.generic.ok',
			view: 'grid',
			size: 0,
			location: null,
			parentFolder: { id: 'parent-id', parentFolderLinkId: 55 },
			shares: null,
			tags: null,
			...overrides,
		},
	],
});

describe('Folder repo', () => {
	let folderRepo: FolderRepo;
	let httpSpy: jasmine.SpyObj<HttpService>;
	let httpV2Spy: jasmine.SpyObj<HttpV2Service>;

	beforeEach(() => {
		httpSpy = jasmine.createSpyObj('HttpService', [
			'sendRequest',
			'sendRequestPromise',
		]);
		httpV2Spy = jasmine.createSpyObj('HttpV2Service', ['get', 'patch']);

		TestBed.configureTestingModule({
			providers: [
				FolderRepo,
				{ provide: HttpService, useValue: httpSpy },
				{ provide: HttpV2Service, useValue: httpV2Spy },
			],
		});

		folderRepo = TestBed.inject(FolderRepo);
	});

	it('should post folderVOs and return a FolderResponse', async () => {
		const folder1 = new FolderVO({ folderId: 1 });
		const folder2 = new FolderVO({ folderId: 2 });
		const mockResponse = { success: true } as any;

		httpSpy.sendRequestPromise.and.resolveTo(mockResponse);
		const result = await folderRepo.post([folder1, folder2]);

		expect(httpSpy.sendRequestPromise).toHaveBeenCalledWith(
			'/folder/post',
			[
				{ FolderVO: jasmine.any(FolderVO) },
				{ FolderVO: jasmine.any(FolderVO) },
			],
			{ ResponseClass: jasmine.any(Function) },
		);

		const callArgs = httpSpy.sendRequestPromise.calls.mostRecent().args[1];

		expect(callArgs[0].FolderVO instanceof FolderVO).toBeTrue();
		expect(callArgs[1].FolderVO instanceof FolderVO).toBeTrue();

		expect(result).toBe(mockResponse);
	});

	it('should get folder with children using the auth token', async () => {
		const mockFolderVO = { folderId: 42 } as FolderVO;

		httpV2Spy.get.and.returnValues(
			of([fakeFolderResponse]),
			of([fakeChildrenResponse]),
		);

		const result = await folderRepo.getWithChildren([mockFolderVO]);

		expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
			folderIds: [42],
		});

		expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder/42/children', {
			pageSize: 99999999,
		});

		expect(result.isSuccessful).toBeTrue();
		expect(result.Results[0].data[0].FolderVO).toBeDefined();
	});

	it('should get folder with children using the share token', async () => {
		const mockFolderVO = { folderId: 42 } as FolderVO;

		httpV2Spy.get.and.returnValues(
			of([fakeFolderResponse]),
			of([fakeChildrenResponse]),
		);

		const result = await folderRepo.getWithChildren(
			[mockFolderVO],
			'share-token-123',
		);

		expect(httpV2Spy.get).toHaveBeenCalledWith(
			'v2/folder',
			{ folderIds: [42] },
			null,
			{ authToken: false, shareToken: 'share-token-123' },
		);

		expect(httpV2Spy.get).toHaveBeenCalledWith(
			'v2/folder/42/children',
			jasmine.anything(),
			null,
			{ authToken: false, shareToken: 'share-token-123' },
		);

		expect(result.Results[0].data[0].FolderVO).toBeDefined();
	});

	it('should get folder with children using fallback to auth token', async () => {
		const mockFolderVO = { folderId: 42 } as FolderVO;

		// The folder and children requests run in parallel, so the call order
		// is: folder (share token), children (share token), then the
		// auth-token fallbacks in the same order.
		httpV2Spy.get.and.returnValues(
			of([emptyResponse]),
			of([{}]),
			of([fakeFolderResponse]),
			of([fakeChildrenResponse]),
		);

		const result = await folderRepo.getWithChildren(
			[mockFolderVO],
			'bad-share-token',
		);

		expect(httpV2Spy.get).toHaveBeenCalledWith(
			'v2/folder',
			{ folderIds: [42] },
			null,
			{ authToken: false, shareToken: 'bad-share-token' },
		);

		expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
			folderIds: [42],
		});

		expect(result.Results[0].data[0].FolderVO).toBeDefined();
	});

	describe('getWithChildren error handling', () => {
		it('should return a FolderResponse with isSuccessful falsy when the Stela API throws', async () => {
			const folderVO = new FolderVO({ folderId: 42 });
			const apiError = { error: { error: 'Internal server error' } };

			httpV2Spy.get.and.returnValue(
				new Observable((subscriber) => subscriber.error(apiError)),
			);

			const result = await folderRepo.getWithChildren([folderVO]);

			expect(result.isSuccessful).toBeFalsy();
		});

		it('should surface the error message from err.error.error via getMessage()', async () => {
			const folderVO = new FolderVO({ folderId: 42 });
			const apiError = { error: { error: 'Folder not found' } };

			httpV2Spy.get.and.returnValue(
				new Observable((subscriber) => subscriber.error(apiError)),
			);

			const result = await folderRepo.getWithChildren([folderVO]);

			expect(result.getMessage()).toBe('Folder not found');
		});

		it('should return an empty string message when err.error.error is absent', async () => {
			// Must be a string, not undefined: error handlers pass the message
			// through PrConstantsService.translate, which crashes on undefined.
			const folderVO = new FolderVO({ folderId: 42 });

			httpV2Spy.get.and.returnValue(
				new Observable((subscriber) => subscriber.error({})),
			);

			const result = await folderRepo.getWithChildren([folderVO]);

			expect(result.getMessage()).toBe('');
		});

		it('should surface the message of internally thrown errors via getMessage()', async () => {
			const folderVO = new FolderVO({ folderId: 42 });

			// Both the folder and children endpoints return empty results,
			// so getWithChildren throws its internal "no folder" Error.
			httpV2Spy.get.and.returnValue(of([{ items: [] }]));

			const result = await folderRepo.getWithChildren([folderVO]);

			expect(result.getMessage()).toBe(
				'No folder returned from getStelaFolders',
			);
		});
	});

	describe('resolveFolderId', () => {
		it('should not call the legacy /folder/get endpoint when folderId is already present', async () => {
			const folderVO = new FolderVO({ folderId: 42 });

			httpV2Spy.get.and.returnValues(
				of([buildStelaFolderResponse()]),
				of([{ items: [] }]),
			);

			await folderRepo.getWithChildren([folderVO]);

			expect(httpSpy.sendRequestPromise).not.toHaveBeenCalled();
		});

		it('should call legacy /folder/get to resolve folderId when it is missing', async () => {
			const folderVO = new FolderVO({
				archiveNbr: '0001-0001',
				folder_linkId: 123,
			});

			const resolvedFolderResponse = new FolderResponse({
				isSuccessful: true,
				Results: [
					{
						data: [{ FolderVO: { folderId: 99 } }],
						status: true,
						message: ['OK'],
						resultDT: new Date().toISOString(),
						createdDT: null,
						updatedDT: null,
					},
				],
			});

			httpSpy.sendRequestPromise.and.resolveTo(resolvedFolderResponse);
			httpV2Spy.get.and.returnValues(
				of([buildStelaFolderResponse({ folderId: '99' })]),
				of([{ items: [] }]),
			);

			await folderRepo.getWithChildren([folderVO]);

			expect(httpSpy.sendRequestPromise).toHaveBeenCalledWith(
				'/folder/get',
				jasmine.any(Array),
				jasmine.any(Object),
			);

			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
				folderIds: [99],
			});
		});
	});

	describe('convertStelaFolderToFolderVO mapping', () => {
		const getConvertedFolder = async () => {
			const folderVO = new FolderVO({ folderId: 42 });
			httpV2Spy.get.and.returnValues(
				of([buildStelaFolderResponse()]),
				of([{ items: [] }]),
			);
			const result = await folderRepo.getWithChildren([folderVO]);
			return result.getFolderVO(true);
		};

		it('should map parentFolder_linkId from the parentFolder object', async () => {
			const folder = await getConvertedFolder();

			expect(folder.parentFolder_linkId).toBe(55);
		});

		it('should map the folder path arrays for breadcrumbs', async () => {
			const folder = await getConvertedFolder();

			expect(folder.pathAsText).toEqual(['My Files', 'Test Folder']);
			expect(folder.pathAsFolder_linkId).toEqual([55, 100]);
			expect(folder.pathAsArchiveNbr).toEqual(['ARCH-000', 'ARCH-001']);
		});

		it('should leave folder_linkType undefined since the backend omits it', async () => {
			const folder = await getConvertedFolder();

			expect(folder.folder_linkType).toBeUndefined();
		});
	});

	describe('accessRole derivation', () => {
		const CURRENT_ARCHIVE_ID = 77;
		const storage = new StorageService();

		const okShareWithCurrentArchive = (accessRole: string) => ({
			id: 'share-1',
			status: 'status.generic.ok',
			accessRole,
			archive: {
				id: String(CURRENT_ARCHIVE_ID),
				name: 'My Archive',
				thumbURL200: '',
			},
		});

		const getConvertedFolder = async (
			folderOverrides: Record<string, unknown>,
			children: unknown[] = [],
		) => {
			httpV2Spy.get.and.returnValues(
				of([buildStelaFolderResponse(folderOverrides)]),
				of([{ items: children }]),
			);
			const result = await folderRepo.getWithChildren([
				new FolderVO({ folderId: 42 }),
			]);
			return result.getFolderVO(true);
		};

		beforeEach(() => {
			clearDerivedStelaAccessRoleCache();
			clearSharesBreadcrumbPathCache();
			storage.local.set('archive', { archiveId: CURRENT_ARCHIVE_ID });
		});

		afterEach(() => {
			clearDerivedStelaAccessRoleCache();
			clearSharesBreadcrumbPathCache();
			storage.local.delete('archive');
			storage.session.delete('archive');
		});

		it('derives owner for folders belonging to the current archive', async () => {
			const folder = await getConvertedFolder({
				archive: { id: String(CURRENT_ARCHIVE_ID), name: 'My Archive' },
			});

			expect(folder.accessRole).toBe('access.role.owner');
		});

		it('derives the share role for folders shared with the current archive', async () => {
			const folder = await getConvertedFolder({
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: [okShareWithCurrentArchive('access.role.viewer')],
			});

			expect(folder.accessRole).toBe('access.role.viewer');
		});

		it('ignores shares with the current archive that are not status-ok', async () => {
			const folder = await getConvertedFolder({
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: [
					{
						...okShareWithCurrentArchive('access.role.viewer'),
						status: 'status.generic.pending',
					},
				],
			});

			expect(folder.accessRole).toBe('access.role.owner');
		});

		it('passes a shared folder role down to children without their own shares', async () => {
			const childStelaFolder = {
				folderId: 'child-folder-1',
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: null,
			};
			const childStelaRecord = {
				recordId: 'child-record-1',
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: null,
				files: [],
				tags: null,
				location: null,
			};

			const folder = await getConvertedFolder(
				{
					archive: { id: 'other-archive', name: 'Other Archive' },
					shares: [okShareWithCurrentArchive('access.role.viewer')],
				},
				[childStelaFolder, childStelaRecord],
			);

			expect(folder.ChildItemVOs.length).toBe(2);
			folder.ChildItemVOs.forEach((childItem) => {
				expect(childItem.accessRole).toBe('access.role.viewer');
			});
		});

		it('prefers a child item direct share over the inherited parent role', async () => {
			const childStelaRecord = {
				recordId: 'child-record-1',
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: [okShareWithCurrentArchive('access.role.editor')],
				files: [],
				tags: null,
				location: null,
			};

			const folder = await getConvertedFolder(
				{
					archive: { id: 'other-archive', name: 'Other Archive' },
					shares: [okShareWithCurrentArchive('access.role.viewer')],
				},
				[childStelaRecord],
			);

			expect(folder.ChildItemVOs[0].accessRole).toBe('access.role.editor');
		});

		it('keeps the shared role when navigating deeper into a shared subfolder tree', async () => {
			const subfolderStelaFolder = {
				folderId: 'subfolder-1',
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: null,
			};

			// First navigation: the directly-shared folder, whose children
			// include the subfolder. Stela puts the share only on the folder
			// that was shared, so the subfolder itself carries no share.
			await getConvertedFolder(
				{
					archive: { id: 'other-archive', name: 'Other Archive' },
					shares: [okShareWithCurrentArchive('access.role.viewer')],
				},
				[subfolderStelaFolder],
			);

			// Second navigation: into the subfolder, a separate request with
			// no share data and no parent context of its own.
			httpV2Spy.get.and.returnValues(
				of([
					buildStelaFolderResponse({
						folderId: 'subfolder-1',
						archive: { id: 'other-archive', name: 'Other Archive' },
						shares: null,
					}),
				]),
				of([
					{
						items: [
							{
								recordId: 'nested-record-1',
								files: [],
								tags: null,
								location: null,
								archive: { id: 'other-archive', name: 'Other Archive' },
								shares: null,
							},
						],
					},
				]),
			);
			const result = await folderRepo.getWithChildren([
				new FolderVO({ folderId: 'subfolder-1' }),
			]);
			const subfolder = result.getFolderVO(true);

			expect(subfolder.accessRole).toBe('access.role.viewer');
			expect(subfolder.ChildItemVOs[0].accessRole).toBe('access.role.viewer');
		});

		it('falls back to owner when no current archive is cached', async () => {
			storage.local.delete('archive');

			const folder = await getConvertedFolder({
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: [okShareWithCurrentArchive('access.role.viewer')],
			});

			expect(folder.accessRole).toBe('access.role.owner');
		});

		it('rebuilds the breadcrumb path for folders shared with the current archive', async () => {
			const folder = await getConvertedFolder({
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: [okShareWithCurrentArchive('access.role.viewer')],
			});

			expect(folder.pathAsText).toEqual(['Shares', 'Test Folder']);
			expect(folder.pathAsFolder_linkId).toEqual([0, 100]);
			expect(folder.pathAsArchiveNbr).toEqual(['0000-0000', 'ARCH-001']);
		});

		it('keeps the owner path for folders in the current archive', async () => {
			const folder = await getConvertedFolder({
				archive: { id: String(CURRENT_ARCHIVE_ID), name: 'My Archive' },
			});

			expect(folder.pathAsText).toEqual(['My Files', 'Test Folder']);
		});

		it('extends the shares breadcrumb path when navigating into a subfolder', async () => {
			const subfolderStelaFolder = {
				folderId: 'subfolder-1',
				displayName: 'Subfolder',
				archiveNumber: 'ARCH-002',
				folderLinkId: 200,
				archive: { id: 'other-archive', name: 'Other Archive' },
				shares: null,
			};

			await getConvertedFolder(
				{
					archive: { id: 'other-archive', name: 'Other Archive' },
					shares: [okShareWithCurrentArchive('access.role.viewer')],
				},
				[subfolderStelaFolder],
			);

			httpV2Spy.get.and.returnValues(
				of([
					buildStelaFolderResponse({
						folderId: 'subfolder-1',
						displayName: 'Subfolder',
						archiveNumber: 'ARCH-002',
						folderLinkId: 200,
						archive: { id: 'other-archive', name: 'Other Archive' },
						shares: null,
					}),
				]),
				of([{ items: [] }]),
			);
			const result = await folderRepo.getWithChildren([
				new FolderVO({ folderId: 'subfolder-1' }),
			]);
			const subfolder = result.getFolderVO(true);

			expect(subfolder.pathAsText).toEqual([
				'Shares',
				'Test Folder',
				'Subfolder',
			]);

			expect(subfolder.pathAsFolder_linkId).toEqual([0, 100, 200]);
		});
	});

	describe('getFolderShareLink', () => {
		const mockShareLink: ShareLink = {
			id: 'link1',
			itemId: '123',
			itemType: 'folder',
			token: 'abc',
			permissionsLevel: 'viewer',
			accessRestrictions: 'none',
			maxUses: null,
			usesExpended: null,
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-01'),
		};

		it('should fetch share links for a folder', async () => {
			const folderVO = new FolderVO({ folderId: 123 });

			httpV2Spy.get.and.returnValue(of([{ items: [mockShareLink] }]));

			const result = await folderRepo.getFolderShareLink(folderVO);

			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder/123/share_links');
			expect(result).toEqual([mockShareLink]);
		});

		it('should return empty array when no share links exist', async () => {
			const folderVO = new FolderVO({ folderId: 456 });

			httpV2Spy.get.and.returnValue(of([{ items: [] }]));

			const result = await folderRepo.getFolderShareLink(folderVO);

			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder/456/share_links');
			expect(result).toEqual([]);
		});

		it('should return multiple share links when they exist', async () => {
			const folderVO = new FolderVO({ folderId: 789 });
			const secondShareLink: ShareLink = {
				...mockShareLink,
				id: 'link2',
				token: 'def',
			};

			httpV2Spy.get.and.returnValue(
				of([{ items: [mockShareLink, secondShareLink] }]),
			);

			const result = await folderRepo.getFolderShareLink(folderVO);

			expect(result).toEqual([mockShareLink, secondShareLink]);
			expect(result.length).toBe(2);
		});
	});

	describe('updateStelaFolder', () => {
		it('should send PATCH request with displayTime as EDTF interval', async () => {
			const folderVO = new FolderVO({
				folderId: 123,
				displayTime: '1985-05-20T00:00:00Z/1990-06-15T00:00:00Z',
			});

			httpV2Spy.patch.and.returnValue(of([mockStelaFolder]));

			const result = await folderRepo.updateStelaFolder(folderVO);

			expect(httpV2Spy.patch).toHaveBeenCalledWith('v2/folder/123', {
				displayTime: '1985-05-20T00:00:00Z/1990-06-15T00:00:00Z',
			});

			expect(result.Results[0][0].FolderVO).toBeDefined();
		});

		it('should send displayTime without end date when only start date is set', async () => {
			const folderVO = new FolderVO({
				folderId: 456,
				displayTime: '1985-05-20T00:00:00Z',
			});

			httpV2Spy.patch.and.returnValue(of([mockStelaFolder]));

			await folderRepo.updateStelaFolder(folderVO);

			expect(httpV2Spy.patch).toHaveBeenCalledWith('v2/folder/456', {
				displayTime: '1985-05-20T00:00:00Z',
			});
		});

		it('should convert response StelaFolder to FolderVO', async () => {
			const folderVO = new FolderVO({
				folderId: 123,
				displayTime: '1985-05-20T00:00:00Z',
			});

			httpV2Spy.patch.and.returnValue(of([mockStelaFolder]));

			const result = await folderRepo.updateStelaFolder(folderVO);

			expect(result.Results[0][0].FolderVO).toBeDefined();
			expect(result.Results[0][0].FolderVO.folderId).toBe('123');
			expect(result.Results[0][0].FolderVO.displayName).toBe('Test Folder');
		});
	});

	describe('getStelaFolderVOs', () => {
		it('should fetch single folder and return FolderResponse', async () => {
			const folderVO = new FolderVO({ folderId: 123 });

			httpV2Spy.get.and.returnValue(of([{ items: [mockStelaFolder] }]));

			const result = await folderRepo.getStelaFolderVOs([folderVO]);

			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
				folderIds: [123],
			});

			const folders = result.getFolderVOs();

			expect(folders.length).toBe(1);
			expect(folders[0].folderId).toBe('123');
		});

		it('should fetch multiple folders and return FolderResponse', async () => {
			const folderVO1 = new FolderVO({ folderId: 123 });
			const folderVO2 = new FolderVO({ folderId: 456 });
			const mockStelaFolder2 = { ...mockStelaFolder, folderId: '456' };

			httpV2Spy.get.and.returnValue(
				of([{ items: [mockStelaFolder, mockStelaFolder2] }]),
			);

			const result = await folderRepo.getStelaFolderVOs([folderVO1, folderVO2]);

			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
				folderIds: [123, 456],
			});

			const folders = result.getFolderVOs();

			expect(folders.length).toBe(2);
			expect(folders[0].folderId).toBe('123');
			expect(folders[1].folderId).toBe('456');
		});

		it('should use share token when provided', async () => {
			const folderVO = new FolderVO({ folderId: 123 });

			httpV2Spy.get.and.returnValue(of([{ items: [mockStelaFolder] }]));

			await folderRepo.getStelaFolderVOs([folderVO], 'share-token-abc');

			expect(httpV2Spy.get).toHaveBeenCalledWith(
				'v2/folder',
				{ folderIds: [123] },
				null,
				{ authToken: false, shareToken: 'share-token-abc' },
			);
		});

		it('should fallback to auth token when share token returns empty', async () => {
			const folderVO = new FolderVO({ folderId: 123 });

			httpV2Spy.get.and.returnValues(
				of([{ items: [] }]),
				of([{ items: [mockStelaFolder] }]),
			);

			const result = await folderRepo.getStelaFolderVOs(
				[folderVO],
				'bad-share-token',
			);

			expect(httpV2Spy.get).toHaveBeenCalledTimes(2);
			expect(httpV2Spy.get).toHaveBeenCalledWith(
				'v2/folder',
				{ folderIds: [123] },
				null,
				{ authToken: false, shareToken: 'bad-share-token' },
			);

			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
				folderIds: [123],
			});

			const folders = result.getFolderVOs();

			expect(folders[0]).toBeDefined();
		});
	});
});
