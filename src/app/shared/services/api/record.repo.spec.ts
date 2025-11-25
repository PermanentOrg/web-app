import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';
import { HttpService } from '@shared/services/http/http.service';
import { RecordRepo, RecordResponse } from '@shared/services/api/record.repo';
import { RecordVO } from '@root/app/models';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('RecordRepo', () => {
	let repo: RecordRepo;
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

		repo = new RecordRepo(
			TestBed.inject(HttpService),
			TestBed.inject(HttpV2Service),
		);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	// in order to test that the request is made with the auth token,
	// with the share token and that the fallback works, the test suite
	// should be refactored to mock the http and httpV2 services

	// isolating the record.repo service functionality from other
	// dependencies would make the tests more reliable
	it('should use a V2 request to get records by id', fakeAsync(() => {
		const fakeRecordVO = {
			recordId: 5,
		} as unknown as RecordVO;

		const recordPromise = repo.get([fakeRecordVO]);

		tick();

		const req = httpMock.expectOne(
			`${environment.apiUrl}/v2/record?recordIds[]=5`,
		);

		expect(req.request.method).toBe('GET');
		expect(req.request.headers.get('Request-Version')).toBe('2');
		req.flush([fakeRecordVO]);
		recordPromise.then((recordResponse: RecordResponse) => {
			expect(recordResponse).toBeDefined();
		});
	}));

	it('should use a V2 request for registerRecord', (done) => {
		const testRecord = new RecordVO({
			displayName: 'test',
			parentFolderId: 1,
			uploadFileName: 'test.jpg',
			size: 1234,
		});
		const testUrl = 'test';

		repo
			.registerRecord(testRecord, testUrl, '1')
			.then((_) => {
				done();
			})
			.catch(done.fail);

		const req = httpMock.expectOne(
			`${environment.apiUrl}/record/registerRecord`,
		);

		expect(req.request.method).toBe('POST');
		expect(req.request.headers.get('Request-Version')).toBe('2');
		expect(req.request.body).toEqual({
			displayName: testRecord.displayName,
			parentFolderId: testRecord.parentFolderId,
			uploadFileName: testRecord.uploadFileName,
			size: testRecord.size,
			s3url: testUrl,
			archiveId: '1',
		});
		req.flush(testRecord);
	});

	it('should send a POST request for update', (done) => {
		const testData = {
			recordId: 1,
			displayName: 'Updated Test',
			parentFolderId: 2,
			uploadFileName: 'updated.jpg',
			size: 4321,
		};
		const testRecord = new RecordVO(testData);
		const archiveId = 10;

		repo
			.update([testRecord], archiveId)
			.then((_) => {
				done();
			})
			.catch(done.fail);

		const req = httpMock.expectOne(`${environment.apiUrl}/record/update`);

		expect(req.request.method).toBe('POST');
		expect(req.request.headers.get('Request-Version')).toBe('2');
		for (const property in testData) {
			if (Object.hasOwn(testData, property)) {
				expect(req.request.body[property]).toBe(testData[property]);
			}
		}

		expect(req.request.body.archiveId).toBe(archiveId);

		req.flush(testRecord);
	});

	it('should adjust property names properly for v2 update', (done) => {
		const testRecord = new RecordVO({
			recordId: 1,
			displayDT: '2025-01-01T00:00:00.000Z',
		});
		const archiveId = 10;

		repo
			.update([testRecord], archiveId)
			.then((_) => {
				done();
			})
			.catch(done.fail);

		const req = httpMock.expectOne(`${environment.apiUrl}/record/update`);

		expect(req.request.method).toBe('POST');
		expect(req.request.headers.get('Request-Version')).toBe('2');
		expect(req.request.body.displayDt).toBe('2025-01-01T00:00:00.000Z');

		req.flush(testRecord);
	});
});
