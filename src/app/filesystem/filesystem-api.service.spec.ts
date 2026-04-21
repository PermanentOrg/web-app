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
	displayName: 'Test Folder',
	ChildItemVOs: [],
	dataStatus: DataStatus.Lean,
};

const mockSuccessResponse = new FolderResponse({
	isSuccessful: true,
	Results: [
		{
			data: [{ FolderVO: mockFolderVO }],
			status: true,
			message: ['OK'],
			resultDT: new Date().toISOString(),
			createdDT: null,
			updatedDT: null,
		},
	],
});

const mockFailureResponse = new FolderResponse({
	isSuccessful: false,
	Results: [],
});

const mockApiService = {
	folder: {
		getWithChildren: jasmine
			.createSpy('getWithChildren')
			.and.resolveTo(mockSuccessResponse),
	},
};

describe('FilesystemApiService', () => {
	let service: FilesystemApiService;
	let shareLinksServiceSpy: jasmine.SpyObj<ShareLinksService>;

	beforeEach(() => {
		mockApiService.folder.getWithChildren = jasmine
			.createSpy('getWithChildren')
			.and.resolveTo(mockSuccessResponse);

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

	it('should navigate using getWithChildren with null shareToken when not in an unlisted share', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(false);

		const folder = await service.navigate({ folderId });

		expect(mockApiService.folder.getWithChildren).toHaveBeenCalledWith(
			[jasmine.any(FolderVO)],
			null,
		);

		expect(folder.folderId).toBe(folderId);
		expect(folder.dataStatus).toBe(DataStatus.Lean);
	});

	it('should navigate using getWithChildren with shareToken when in an unlisted share', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(true);
		shareLinksServiceSpy.currentShareToken = 'mock-token';

		const folder = await service.navigate({ folderId });

		expect(mockApiService.folder.getWithChildren).toHaveBeenCalledWith(
			[jasmine.any(FolderVO)],
			'mock-token',
		);

		expect(folder.folderId).toBe(folderId);
		expect(folder.dataStatus).toBe(DataStatus.Lean);
	});

	it('should throw when the response is unsuccessful', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(false);
		mockApiService.folder.getWithChildren.and.resolveTo(mockFailureResponse);

		await expectAsync(service.navigate({ folderId })).toBeRejected();
	});
});
