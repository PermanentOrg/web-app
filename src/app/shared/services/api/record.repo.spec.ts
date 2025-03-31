import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';
import { HttpService } from '@shared/services/http/http.service';
import { RecordRepo } from '@shared/services/api/record.repo';
import { RecordVO } from '@root/app/models';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('RecordRepo', () => {
  let repo: RecordRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService, HttpV2Service],
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

  it('should use a V2 request for registerRecord', (done) => {
    const testRecord = new RecordVO({
      displayName: 'test',
      parentFolderId: 1,
      uploadFileName: 'test.jpg',
      size: 1234,
    });
    const testUrl = 'test';

    repo
      .registerRecord(testRecord, testUrl)
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
      expect(req.request.body[property]).toBe(testData[property]);
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
