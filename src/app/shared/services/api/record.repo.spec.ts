import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { of } from 'rxjs';
import { environment } from '@root/environments/environment';
import { HttpService } from '@shared/services/http/http.service';
import { RecordRepo, RecordResponse } from '@shared/services/api/record.repo';
import { RecordVO } from '@root/app/models';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { ShareLink } from '@root/app/share-links/models/share-link';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('RecordRepo', () => {
	let repo: RecordRepo;
	let httpMock: HttpTestingController;
	let httpService: HttpService;
	let httpV2Service: HttpV2Service;

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

		httpService = TestBed.inject(HttpService);
		httpV2Service = TestBed.inject(HttpV2Service);
		repo = new RecordRepo(httpService, httpV2Service);
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

	describe('getRecordShareLink', () => {
		let httpV2GetSpy: jasmine.Spy;
		let httpSendRequestPromiseSpy: jasmine.Spy;

		const mockShareLink: ShareLink = {
			id: 'link1',
			itemId: '123',
			itemType: 'record',
			token: 'abc',
			permissionsLevel: 'viewer',
			accessRestrictions: 'none',
			maxUses: null,
			usesExpended: null,
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-01'),
		};

		beforeEach(() => {
			httpV2GetSpy = spyOn(httpV2Service, 'get');
			httpSendRequestPromiseSpy = spyOn(httpService, 'sendRequestPromise');
		});

		it('should fetch share links using recordId when available', async () => {
			const recordVO = new RecordVO({ recordId: 123 });

			httpV2GetSpy.and.returnValue(of([{ items: [mockShareLink] }]));

			const result = await repo.getRecordShareLink(recordVO);

			expect(httpV2GetSpy).toHaveBeenCalledWith('v2/record/123/share-links');
			expect(result).toEqual([mockShareLink]);
		});

		it('should fetch recordId by archiveNbr when recordId is not available', async () => {
			const recordVO = new RecordVO({ archiveNbr: 'archive-456' });

			httpSendRequestPromiseSpy.and.resolveTo({
				getRecordVO: () => new RecordVO({ recordId: 789 }),
			});
			httpV2GetSpy.and.returnValue(of([{ items: [mockShareLink] }]));

			const result = await repo.getRecordShareLink(recordVO);

			expect(httpSendRequestPromiseSpy).toHaveBeenCalledWith(
				'/record/get',
				[{ RecordVO: jasmine.objectContaining({ archiveNbr: 'archive-456' }) }],
				jasmine.any(Object),
			);

			expect(httpV2GetSpy).toHaveBeenCalledWith('v2/record/789/share-links');
			expect(result).toEqual([mockShareLink]);
		});

		it('should return empty array when no share links exist', async () => {
			const recordVO = new RecordVO({ recordId: 123 });

			httpV2GetSpy.and.returnValue(of([{ items: [] }]));

			const result = await repo.getRecordShareLink(recordVO);

			expect(result).toEqual([]);
		});
	});
});
