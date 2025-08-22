import { TestBed } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';
import { FolderResponse } from '@shared/services/api/folder.repo';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { FilesystemApiService } from './filesystem-api.service';

describe('FilesystemApiService', () => {
	let service: FilesystemApiService;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
		service = TestBed.inject(FilesystemApiService);
		http = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should be able to navigate', (done) => {
		service
			.navigate({ folderId: 0 })
			.then((folder) => {
				expect(folder.displayName).toBe('Unit Test');
			})
			.catch((response) => {
				fail(response);
			})
			.finally(() => {
				done();
			});

		const req = http.expectOne(`${environment.apiUrl}/folder/navigateLean`);

		req.flush({
			isSuccessful: true,
			Results: [
				{
					data: [
						{
							FolderVO: {
								folderId: 0,
								displayName: 'Unit Test',
								ChildItemVOs: [],
							},
						},
					],
				},
			],
		});

		http.verify();
	});

	it('will throw the invalid folder response for a failed request', (done) => {
		service
			.navigate({ folderId: 0 })
			.then(() => {
				fail('Expected a rejected promise, but it resolved instead');
			})
			.catch((response: FolderResponse) => {
				expect(response.getMessage()).toBe('Unit Test Error');
			})
			.finally(() => {
				done();
			});

		const req = http.expectOne(`${environment.apiUrl}/folder/navigateLean`);

		req.flush({
			isSuccessful: false,
			message: 'Unit Test Error',
		});

		http.verify();
	});
});
