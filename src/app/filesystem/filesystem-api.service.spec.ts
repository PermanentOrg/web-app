import { TestBed } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { FolderVO } from '@models/index';
import { DataStatus } from '@models/data-status.enum';
import { ApiService } from '@shared/services/api/api.service';
import { ShareLinksService } from '../share-links/services/share-links.service';
import { FilesystemApiService } from './filesystem-api.service';

const folderId = 42;
const mockResponse = new FolderResponse({
	isSuccessful: true,
	Results: [
		{
			data: [
				{
					FolderVO: {
						folderId,
						displayName: 'Unlisted Folder',
						ChildItemVOs: [],
					},
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
			// simulate observable for firstValueFrom
			{
				toPromise: async () =>
					await Promise.resolve({
						isSuccessful: true,
						getFolderVO: () => ({ id: 'mock-folder', name: 'Mock Folder' }),
					}),
			},
		),
	},
};

describe('FilesystemApiService', () => {
	let service: FilesystemApiService;
	let http: HttpTestingController;
	let shareLinksServiceSpy: jasmine.SpyObj<ShareLinksService>;

	beforeEach(() => {
		shareLinksServiceSpy = jasmine.createSpyObj('ShareLinksService', [
			'isUnlistedShare',
			'currentShareToken',
		]);

		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
				FilesystemApiService,
				{ provide: ShareLinksService, useValue: shareLinksServiceSpy },
				{ provide: ApiService, useValue: mockApiService },
			],
		});

		service = TestBed.inject(FilesystemApiService);
		http = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should navigate using getWithChildren when in unlisted share', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(true);
		shareLinksServiceSpy.currentShareToken = 'mock-token';

		const apiService = TestBed.inject(ApiService);

		const folder = await service.navigate({ folderId });

		expect(apiService.folder.getWithChildren).toHaveBeenCalledWith(
			[jasmine.any(FolderVO)],
			'mock-token',
		);

		expect(folder.folderId).toBe(folderId);
		expect(folder.displayName).toBe('Unlisted Folder');
		expect(folder.dataStatus).toBe(DataStatus.Lean);
	});

	it('should throw FolderResponse error if response is unsuccessful', async () => {
		shareLinksServiceSpy.isUnlistedShare.and.resolveTo(false);
		mockApiService.folder.navigateLean.and.resolveTo({ isSuccessful: false });

		const promise = service.navigate({ folderId: 0 });

		try {
			await promise;
			fail('Expected promise to reject');
		} catch (error) {
			expect(error).toBeDefined();
		}

		http.verify();
	});
});
