import { TestBed } from '@angular/core/testing';
import { FolderVO } from '@models/index';
import { of } from 'rxjs';
import { ShareLink } from '@root/app/share-links/models/share-link';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { HttpService } from '../http/http.service';
import { FolderRepo, FolderResponse } from './folder.repo';

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
	paths: {
		names: ['path1', 'path2'],
		folderLinkIds: ['11', '22'],
		archiveNumbers: ['0001-0000', '0002-0000'],
	},
	accessRole: 'owner',
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

		httpV2Spy.get.and.returnValues(
			of([emptyResponse]),
			of([fakeFolderResponse]),
			of([emptyResponse]),
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

	describe('folder timestamps', () => {
		it('should map createdAt and updatedAt onto the FolderVO', async () => {
			const folderVO = new FolderVO({ folderId: 123 });

			httpV2Spy.get.and.returnValue(of([{ items: [mockStelaFolder] }]));

			const result = await folderRepo.getStelaFolderVOs([folderVO]);
			const folder = result.getFolderVOs()[0];

			expect(folder.createdDT).toBe('2024-01-01T00:00:00Z');
			expect(folder.updatedDT).toBe('2024-01-02T00:00:00Z');
		});

		it('should map timestamps onto child folders too, so callers can pick the most recent one', async () => {
			const olderChild = {
				...mockStelaFolder,
				folderId: '900',
				displayName: 'Older',
				updatedAt: '2024-03-01T00:00:00Z',
			};
			const newerChild = {
				...mockStelaFolder,
				folderId: '901',
				displayName: 'Newer',
				updatedAt: '2024-05-01T00:00:00Z',
			};

			httpV2Spy.get.and.returnValues(
				of([{ items: [mockStelaFolder] }]),
				of([{ items: [olderChild, newerChild] }]),
			);

			const result = await folderRepo.getWithChildren([
				new FolderVO({ folderId: 123 }),
			]);
			const children = result.getFolderVO(true).ChildItemVOs;

			expect(children.map((child) => child.updatedDT)).toEqual([
				'2024-03-01T00:00:00Z',
				'2024-05-01T00:00:00Z',
			]);
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

		it('should not issue a request when no folder has a folderId', async () => {
			const syntheticFolder = new FolderVO({ type: 'type.folder.root.share' });

			const result = await folderRepo.getStelaFolderVOs([syntheticFolder]);

			expect(httpV2Spy.get).not.toHaveBeenCalled();
			expect(result.getFolderVOs().length).toBe(0);
		});

		it('should query only the folders that have a folderId', async () => {
			const folderWithId = new FolderVO({ folderId: 123 });
			const folderWithoutId = new FolderVO({ type: 'type.folder.root.share' });

			httpV2Spy.get.and.returnValue(of([{ items: [mockStelaFolder] }]));

			await folderRepo.getStelaFolderVOs([folderWithId, folderWithoutId]);

			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
				folderIds: [123],
			});
		});
	});

	describe('Stela folder conversion', () => {
		const convertFolder = async (overrides: Record<string, unknown>) => {
			httpV2Spy.get.and.returnValue(
				of([{ items: [{ ...mockStelaFolder, ...overrides }] }]),
			);
			const result = await folderRepo.getStelaFolderVOs([
				new FolderVO({ folderId: 123 }),
			]);
			return result.getFolderVOs()[0];
		};

		it('should map archiveNumber to archiveNbr', async () => {
			const folder = await convertFolder({ archiveNumber: '0001-0002' });

			expect(folder.archiveNbr).toBe('0001-0002');
		});

		it('should map folderLinkId to a numeric folder_linkId', async () => {
			const folder = await convertFolder({ folderLinkId: '158329' });

			expect(folder.folder_linkId).toBe(158329);
		});

		it('should accept link ids that already arrive as numbers', async () => {
			const folder = await convertFolder({ folderLinkId: 158329 });

			expect(folder.folder_linkId).toBe(158329);
		});

		// The folder picker renders child thumbnails straight from this response,
		// with no follow-up lean fetch, so the mapping has to survive the
		// folder -> children conversion.
		it('should carry child record thumbnails through getWithChildren', async () => {
			httpV2Spy.get.and.returnValues(
				of([{ items: [mockStelaFolder] }]),
				of([
					{
						items: [
							{
								recordId: '77',
								displayName: 'A photo',
								folderLinkId: '900',
								archiveNumber: '0001-0003',
								thumbnailUrls: { '200': 'thumb200', '256': 'thumb256' },
							},
						],
					},
				]),
			);

			const result = await folderRepo.getWithChildren([
				new FolderVO({ folderId: 123 }),
			]);
			const child = result.getFolderVO(true).ChildItemVOs[0];

			expect(child.thumbURL200).toBe('thumb200');
			expect(child.thumbnail256).toBe('thumb256');
		});

		// Stela's children endpoint ranks folders and records together by the
		// parent folder's sort setting, so the response order is the render order.
		it('should keep children in the order the response sent them', async () => {
			httpV2Spy.get.and.returnValues(
				of([{ items: [mockStelaFolder] }]),
				of([
					{
						items: [
							{ recordId: '77', displayName: 'Apple', folderLinkId: '900' },
							{ folderId: '78', displayName: 'Banana', folderLinkId: '901' },
							{ recordId: '79', displayName: 'Cherry', folderLinkId: '902' },
							{ folderId: '80', displayName: 'Date', folderLinkId: '903' },
						],
					},
				]),
			);

			const result = await folderRepo.getWithChildren([
				new FolderVO({ folderId: 123 }),
			]);
			const childNames = result
				.getFolderVO(true)
				.ChildItemVOs.map((child) => child.displayName);

			expect(childNames).toEqual(['Apple', 'Banana', 'Cherry', 'Date']);
		});

		it('should still expose children split by kind, each in response order', async () => {
			httpV2Spy.get.and.returnValues(
				of([{ items: [mockStelaFolder] }]),
				of([
					{
						items: [
							{ recordId: '77', displayName: 'Apple', folderLinkId: '900' },
							{ folderId: '78', displayName: 'Banana', folderLinkId: '901' },
							{ recordId: '79', displayName: 'Cherry', folderLinkId: '902' },
							{ folderId: '80', displayName: 'Date', folderLinkId: '903' },
						],
					},
				]),
			);

			const folder = (
				await folderRepo.getWithChildren([new FolderVO({ folderId: 123 })])
			).getFolderVO();

			expect(folder.ChildFolderVOs.map((child) => child.displayName)).toEqual([
				'Banana',
				'Date',
			]);

			expect(folder.RecordVOs.map((child) => child.displayName)).toEqual([
				'Apple',
				'Cherry',
			]);
		});

		it('should leave link ids undefined rather than NaN when absent', async () => {
			const folder = await convertFolder({ folderLinkId: undefined });

			expect(folder.folder_linkId).toBeUndefined();
		});

		it('should leave link ids undefined rather than 0 when blank', async () => {
			const folder = await convertFolder({ folderLinkId: '  ' });

			expect(folder.folder_linkId).toBeUndefined();
		});

		it('should leave link ids undefined when they are not numeric', async () => {
			const folder = await convertFolder({ folderLinkId: 'not-a-number' });

			expect(folder.folder_linkId).toBeUndefined();
		});

		it('should map the breadcrumb archive numbers', async () => {
			const folder = await convertFolder({
				paths: {
					names: ['My Files', 'Photos'],
					folderLinkIds: ['11', '22'],
					archiveNumbers: ['0001-0000', '0002-0000'],
				},
			});

			expect(folder.pathAsArchiveNbr).toEqual(['0001-0000', '0002-0000']);
		});

		it('should map the breadcrumb link ids as numbers', async () => {
			const folder = await convertFolder({
				paths: {
					names: ['My Files', 'Photos'],
					folderLinkIds: ['11', '22'],
					archiveNumbers: ['0001-0000', '0002-0000'],
				},
			});

			expect(folder.pathAsFolder_linkId).toEqual([11, 22]);
		});
	});

	describe('getWithChildrenByIdentifier', () => {
		it('should go straight to Stela when the folder already has an id', async () => {
			httpV2Spy.get.and.returnValues(
				of([{ items: [mockStelaFolder] }]),
				of([{ items: [] }]),
			);

			await folderRepo.getWithChildrenByIdentifier(
				new FolderVO({ folderId: 123 }),
			);

			expect(httpSpy.sendRequestPromise).not.toHaveBeenCalled();
			expect(httpV2Spy.get).toHaveBeenCalled();
		});

		it('should resolve the id through v1 when the folder has none', async () => {
			httpSpy.sendRequestPromise.and.resolveTo(
				new FolderResponse({
					isSuccessful: true,
					Results: [{ data: [{ FolderVO: { folderId: '123' } }] }],
				}),
			);
			httpV2Spy.get.and.returnValues(
				of([{ items: [mockStelaFolder] }]),
				of([{ items: [] }]),
			);

			const result = await folderRepo.getWithChildrenByIdentifier(
				new FolderVO({ archiveNbr: '0001-0002', folder_linkId: 55 }),
			);

			expect(httpSpy.sendRequestPromise).toHaveBeenCalled();
			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
				folderIds: ['123'],
			});

			expect(result.isSuccessful).toBeTrue();
		});

		it('should throw the v1 response when the id cannot be resolved', async () => {
			httpSpy.sendRequestPromise.and.resolveTo(
				new FolderResponse({ isSuccessful: false }),
			);

			await expectAsync(
				folderRepo.getWithChildrenByIdentifier(
					new FolderVO({ archiveNbr: '0001-0002', folder_linkId: 55 }),
				),
			).toBeRejected();
		});
	});

	describe('access role translation', () => {
		const convertFolder = async (overrides: Record<string, unknown>) => {
			httpV2Spy.get.and.returnValue(
				of([{ items: [{ ...mockStelaFolder, ...overrides }] }]),
			);
			const result = await folderRepo.getStelaFolderVOs([
				new FolderVO({ folderId: 123 }),
			]);
			return result.getFolderVOs()[0];
		};

		it("should translate Stela's role into ours", async () => {
			const folder = await convertFolder({ accessRole: 'owner' });

			expect(folder.accessRole).toBe('access.role.owner');
		});

		it('should translate manager to manager, not curator', async () => {
			const folder = await convertFolder({ accessRole: 'manager' });

			expect(folder.accessRole).toBe('access.role.manager');
		});

		it('should add no role at all when Stela sends nothing', async () => {
			const folder = await convertFolder({ accessRole: undefined });

			expect(Object.hasOwn(folder, 'accessRole')).toBeFalse();
		});

		it('should add no role at all when Stela sends null', async () => {
			const folder = await convertFolder({ accessRole: null });

			expect(Object.hasOwn(folder, 'accessRole')).toBeFalse();
		});

		it('should add no role at all when Stela sends one we cannot translate', async () => {
			const folder = await convertFolder({ accessRole: 'archivist' });

			expect(Object.hasOwn(folder, 'accessRole')).toBeFalse();
		});

		it('should merge onto an existing folder without breaking its role', async () => {
			const existingFolder = new FolderVO({
				folderId: '123',
				accessRole: 'access.role.owner',
			});

			existingFolder.update(await convertFolder({ accessRole: 'owner' }));

			expect(existingFolder.accessRole).toBe('access.role.owner');
		});

		it('should leave an existing role alone when Stela sends none', async () => {
			const existingFolder = new FolderVO({
				folderId: '123',
				accessRole: 'access.role.owner',
			});

			existingFolder.update(await convertFolder({ accessRole: undefined }));

			expect(existingFolder.accessRole).toBe('access.role.owner');
		});

		it('should translate the role on child folders too', async () => {
			httpV2Spy.get.and.returnValues(
				of([{ items: [mockStelaFolder] }]),
				of([
					{
						items: [
							{ ...mockStelaFolder, folderId: '999', accessRole: 'viewer' },
						],
					},
				]),
			);

			const result = await folderRepo.getWithChildren([
				new FolderVO({ folderId: 123 }),
			]);
			const child = result.getFolderVO(true).ChildItemVOs[0];

			expect(child.accessRole).toBe('access.role.viewer');
		});
	});
});
