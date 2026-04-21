import { TestBed } from '@angular/core/testing';
import { FolderVO } from '@models/index';
import { Observable, of } from 'rxjs';
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
			folderLinkType: 'type.folder.link.private',
			parentFolderLinkId: 0,
			createdAt: '2024-01-01T00:00:00Z',
			updatedAt: '2024-06-01T00:00:00Z',
			description: 'Test',
			displayTimestamp: '2024-01-01T00:00:00Z',
			displayEndTimestamp: null,
			displayName: 'Test Folder',
			downloadName: 'Test Folder',
			imageRatio: 1,
			paths: { names: ['Test Folder'] },
			publicAt: null,
			sort: null,
			thumbnailUrls: null,
			type: 'type.folder.generic',
			status: 'status.generic.ok',
			view: 'grid',
			size: 0,
			location: null,
			parentFolder: { id: 'parent-id' },
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
		httpV2Spy = jasmine.createSpyObj('HttpV2Service', ['get']);

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

		it('should return an empty error message when err.error.error is absent', async () => {
			const folderVO = new FolderVO({ folderId: 42 });

			httpV2Spy.get.and.returnValue(
				new Observable((subscriber) => subscriber.error({})),
			);

			const result = await folderRepo.getWithChildren([folderVO]);

			expect(result.getMessage()).toBeUndefined();
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
});
