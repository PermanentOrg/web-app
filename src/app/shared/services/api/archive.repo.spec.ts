import { TestBed } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { TEST_DATA, TEST_DATA_2 } from '@core/core.module.spec';
import { HttpService } from '@shared/services/http/http.service';
import {
	ArchiveRepo,
	ArchiveResponse,
} from '@shared/services/api/archive.repo';
import { AccountVO, ArchiveVO } from '@root/app/models';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';

describe('ArchiveRepo', () => {
	let repo: ArchiveRepo;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				HttpService,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});

		repo = new ArchiveRepo(TestBed.inject(HttpService));
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should get a single archive', () => {
		const expected = require('@root/test/responses/archive.get.single.success.json');

		repo.get([TEST_DATA.archive]).then((response) => {
			expect(response.getArchiveVO().archiveId).toEqual(
				TEST_DATA.archive.archiveId,
			);

			expect(response.getArchiveVO().archiveNbr).toEqual(
				TEST_DATA.archive.archiveNbr,
			);
		});

		const req = httpMock.expectOne(`${environment.apiUrl}/archive/get`);
		req.flush(expected);
	});

	it('should get multiple archives', () => {
		const expected = require('@root/test/responses/archive.get.multiple.success.json');

		repo.get([TEST_DATA.archive, TEST_DATA_2.archive]).then((response) => {
			const archives = response.getArchiveVOs();

			expect(archives.length).toBe(2);

			expect(archives[0].archiveId).toEqual(TEST_DATA.archive.archiveId);
			expect(archives[0].archiveNbr).toEqual(TEST_DATA.archive.archiveNbr);

			expect(archives[1].archiveId).toEqual(TEST_DATA_2.archive.archiveId);
			expect(archives[1].archiveNbr).toEqual(TEST_DATA_2.archive.archiveNbr);
		});

		const req = httpMock.expectOne(`${environment.apiUrl}/archive/get`);
		req.flush(expected);
	});

	it('should get all archives for account', () => {
		const expected = require('@root/test/responses/archive.getAllArchive.success.json');
		repo
			.getAllArchives(new AccountVO(TEST_DATA.account))
			.then((response: ArchiveResponse) => {
				const archives = response.getArchiveVOs();
				const count = expected.Results[0].data.length;

				expect(archives.length).toBe(count);
			});

		const req = httpMock.expectOne(
			`${environment.apiUrl}/archive/getAllArchives`,
		);
		req.flush(expected);
	});

	it('should accept the archive type group', () => {
		const archive = new ArchiveVO({ archiveId: 1, type: 'type.archive.group' });

		repo.create(archive).then((response: ArchiveResponse) => {
			const type = response.getArchiveVO().type;

			expect(type).toEqual('type.archive.group');
		});

		const req = httpMock.expectOne(`${environment.apiUrl}/archive/post`);
		req.flush(archive);
	});
});
