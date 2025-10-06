import { TestBed } from '@angular/core/testing';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { FolderVO } from '@models/index';
import { DataStatus } from '@models/data-status.enum';
import { ApiService } from '@shared/services/api/api.service';
import { of } from 'rxjs';
import { ShareLinksService } from '../share-links/services/share-links.service';
import { FilesystemApiService } from './filesystem-api.service';

const folderId = 42;

const mockFolderVO = {
	folderId,
	displayName: 'Unlisted Folder',
	ChildItemVOs: [],
	dataStatus: DataStatus.Lean,
};
const mockResponse = new FolderResponse({
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

const mockApiService = {
	folder: {
		getWithChildren: jasmine
			.createSpy('getWithChildren')
			.and.returnValue(Promise.resolve(mockResponse)),
		navigateLean: jasmine.createSpy('navigateLean').and.returnValue(
			of({
				isSuccessful: true,
				getFolderVO: () => mockFolderVO,
			}),
		),
	},
};

describe('FilesystemApiService', () => {
	let service: FilesystemApiService;
	let shareLinksServiceSpy: jasmine.SpyObj<ShareLinksService>;

	beforeEach(() => {
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

	it('should navigate using navigateLean', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(false);
		mockApiService.folder.navigateLean.and.returnValue(
			of({
				isSuccessful: true,
				getFolderVO: () => mockFolderVO,
			}),
		);

		const folder = await service.navigate({ folderId });

		expect(mockApiService.folder.navigateLean).toHaveBeenCalledWith(
			jasmine.any(FolderVO),
		);

		expect(folder.folderId).toBe(folderId);
		expect(folder.displayName).toBe('Unlisted Folder');
		expect(folder.dataStatus).toBe(DataStatus.Lean);
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
		mockApiService.folder.navigateLean.and.resolveTo(
			of({ isSuccessful: false }),
		);

		const promise = service.navigate({ folderId: 0 });

		try {
			await promise;
			fail('Expected promise to reject');
		} catch (error) {
			expect(error).toBeDefined();
		}
	});
});
