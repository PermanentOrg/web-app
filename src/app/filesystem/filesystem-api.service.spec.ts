import { TestBed } from '@angular/core/testing';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { FolderVO } from '@models/index';
import { DataStatus } from '@models/data-status.enum';
import { ApiService } from '@shared/services/api/api.service';
import { ShareLinksService } from '../share-links/services/share-links.service';
import { FilesystemApiService } from './filesystem-api.service';

const folderId = 42;

const mockFolderVO = {
	folderId,
	displayName: 'Unlisted Folder',
	ChildItemVOs: [],
	dataStatus: DataStatus.Lean,
};

const mockSuccessResponse = new FolderResponse({
	isSuccessful: true,
	Results: [
		{
			data: [
				{
					FolderVO: mockFolderVO,
				},
			],
		},
	],
});

const mockUnsuccessfulResponse = new FolderResponse({
	isSuccessful: false,
	Results: [],
});

let mockApiService: any;

describe('FilesystemApiService', () => {
	let service: FilesystemApiService;
	let shareLinksServiceSpy: jasmine.SpyObj<ShareLinksService>;

	beforeEach(() => {
		mockApiService = {
			folder: {
				getWithChildren: jasmine
					.createSpy('getWithChildren')
					.and.returnValue(Promise.resolve(mockSuccessResponse)),
				getWithChildrenByIdentifier: jasmine
					.createSpy('getWithChildrenByIdentifier')
					.and.returnValue(Promise.resolve(mockSuccessResponse)),
			},
		};

		shareLinksServiceSpy = jasmine.createSpyObj('ShareLinksService', [
			'isUnlistedShare',
			'currentShareToken',
		]);

		TestBed.configureTestingModule({
			providers: [
				FilesystemApiService,
				{ provide: ShareLinksService, useValue: shareLinksServiceSpy },
				{ provide: ApiService, useValue: mockApiService },
			],
		});

		service = TestBed.inject(FilesystemApiService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should navigate using getWithChildrenByIdentifier', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(false);

		const folder = await service.navigate({ folderId });

		expect(
			mockApiService.folder.getWithChildrenByIdentifier,
		).toHaveBeenCalledWith(jasmine.any(FolderVO));

		expect(folder.folderId).toBe(folderId);
		expect(folder.displayName).toBe('Unlisted Folder');
		expect(folder.dataStatus).toBe(DataStatus.Lean);
	});

	it('should navigate by archiveNbr and folder_linkId without a folder id', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(false);

		await service.navigate({ archiveNbr: '0001-0000' });

		const [requestedFolder] =
			mockApiService.folder.getWithChildrenByIdentifier.calls.mostRecent().args;

		expect(requestedFolder.archiveNbr).toBe('0001-0000');
		expect(requestedFolder.folderId).toBeUndefined();
	});

	it('should navigate using getWithChildren when in unlisted share', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(true);
		shareLinksServiceSpy.currentShareToken = 'mock-token';

		const folder = await service.navigate({ folderId });

		expect(mockApiService.folder.getWithChildren).toHaveBeenCalledWith(
			[jasmine.any(FolderVO)],
			'mock-token',
		);

		expect(folder.folderId).toBe(folderId);
		expect(folder.displayName).toBe('Unlisted Folder');
		expect(folder.dataStatus).toBe(DataStatus.Lean);
	});

	it('should throw FolderResponse error if response is unsuccessful', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(false);
		mockApiService.folder.getWithChildrenByIdentifier.and.resolveTo(
			mockUnsuccessfulResponse,
		);

		try {
			await service.navigate({ folderId: 0 });
			fail('Expected promise to reject');
		} catch (error) {
			expect(error).toBeDefined();
		}
	});

	it('should surface a rejection from getWithChildrenByIdentifier', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(false);
		mockApiService.folder.getWithChildrenByIdentifier.and.rejectWith(
			new Error('500 Internal Server Error'),
		);

		await expectAsync(service.navigate({ folderId })).toBeRejected();
	});
});
