import { TestBed } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { FolderRepo } from '@shared/services/api/folder.repo';
import { FolderVO } from '@root/app/models';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('FolderRepo', () => {
	let repo: FolderRepo;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				HttpService,
				HttpV2Service,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});

		repo = new FolderRepo(
			TestBed.inject(HttpService),
			TestBed.inject(HttpV2Service),
		);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should call /folder/getWithChildren and return FolderResponse when isV2=false', async () => {
		const mockResponse = {
			isSuccessful: true,
			Results: [
				{
					data: [
						{ FolderVO: { folderId: 1, folder_linkId: 10, archiveNbr: 99 } },
					],
				},
			],
		};

		const folderVO = { folderId: 1, folder_linkId: 10, archiveNbr: 99 } as any;

		const promise = repo.getWithChildren([folderVO], false);

		const req = httpMock.expectOne(
			`${environment.apiUrl}/folder/getWithChildren`,
		);

		expect(req.request.method).toBe('POST');

		req.flush(mockResponse);

		const result = await promise;

		expect(result).toEqual(jasmine.objectContaining({ isSuccessful: true }));
	});

	it('should call /folder/getWithChildren and return FolderVO when isV2=true', async () => {
		const testRecord = new FolderVO({
			folderId: 2,
			archiveNbr: 101,
			folder_linkId: 51,
			archiveId: 5,
		});

		const promise = repo.getWithChildren([testRecord], true);

		const req = httpMock.expectOne(
			`${environment.apiUrl}/folder/getWithChildren?archiveId=5&folderId=2`,
		);

		expect(req.request.method).toBe('GET');

		req.flush([{ folderId: 2, displayName: 'Test V2 Folder', archiveId: 5 }]);

		const result = await promise;

		expect(result.folderId).toBe(2);
		expect(result.displayName).toBe('Test V2 Folder');
	});
});
