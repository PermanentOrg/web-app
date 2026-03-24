import { TestBed } from '@angular/core/testing';
import { FolderVO } from '@models/index';
import { of } from 'rxjs';
import { ShareLink } from '@root/app/share-links/models/share-link';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { HttpService } from '../http/http.service';
import { FolderRepo } from './folder.repo';

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

		it('should send PATCH request with displayTime as EDTF interval', async () => {
			const folderVO = new FolderVO({
				folderId: 123,
				displayDT: '1985-05-20T00:00:00Z',
				displayEndDT: '1990-06-15T00:00:00Z',
			});

			httpV2Spy.patch.and.returnValue(of([mockStelaFolder]));

			const result = await folderRepo.updateStelaFolder(folderVO);

			expect(httpV2Spy.patch).toHaveBeenCalledWith('v2/folder/123', {
				displayTime: '1985-05-20T00:00:00Z/1990-06-15T00:00:00Z',
			});

			expect(result.Results[0][0].FolderVO).toBeDefined();
		});

		it('should send displayTime without end date when displayEndDT is not provided', async () => {
			const folderVO = new FolderVO({
				folderId: 456,
				displayDT: '1985-05-20T00:00:00Z',
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
				displayDT: '1985-05-20T00:00:00Z',
			});

			httpV2Spy.patch.and.returnValue(of([mockStelaFolder]));

			const result = await folderRepo.updateStelaFolder(folderVO);

			expect(result.Results[0][0].FolderVO).toBeDefined();
			expect(result.Results[0][0].FolderVO.folderId).toBe('123');
			expect(result.Results[0][0].FolderVO.displayName).toBe('Test Folder');
		});
	});

	describe('getStelaFolderVOs', () => {
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

		it('should fetch single folder and return FolderResponse', async () => {
			const folderVO = new FolderVO({ folderId: 123 });

			httpV2Spy.get.and.returnValue(of([{ items: [mockStelaFolder] }]));

			const result = await folderRepo.getStelaFolderVOs([folderVO]);

			expect(httpV2Spy.get).toHaveBeenCalledWith('v2/folder', {
				folderIds: [123],
			});

			expect(result.Results[0].length).toBe(1);
			expect(result.Results[0][0].FolderVO).toBeDefined();
			expect(result.Results[0][0].FolderVO.folderId).toBe('123');
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

			expect(result.Results[0].length).toBe(2);
			expect(result.Results[0][0].FolderVO.folderId).toBe('123');
			expect(result.Results[0][1].FolderVO.folderId).toBe('456');
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

			expect(result.Results[0][0].FolderVO).toBeDefined();
		});
	});
});
