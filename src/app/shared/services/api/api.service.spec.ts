import { TestBed, inject } from '@angular/core/testing';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import * as Repo from '@shared/services/api/index.repo';

import { ApiService } from '@shared/services/api/api.service';

describe('ApiService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [],
			providers: [ApiService, provideHttpClient(withInterceptorsFromDi())],
		});
	});

	it('should be created', inject([ApiService], (service: ApiService) => {
		expect(service).toBeTruthy();
	}));

	it('should have the correct repos attached', inject(
		[ApiService],
		(service: ApiService) => {
			expect(service.account).toEqual(jasmine.any(Repo.AccountRepo));
			expect(service.archive).toEqual(jasmine.any(Repo.ArchiveRepo));
			expect(service.auth).toEqual(jasmine.any(Repo.AuthRepo));
			expect(service.connector).toEqual(jasmine.any(Repo.ConnectorRepo));
			expect(service.folder).toEqual(jasmine.any(Repo.FolderRepo));
			expect(service.record).toEqual(jasmine.any(Repo.RecordRepo));
		},
	));
});
