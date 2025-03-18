import { TestBed, inject } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { TEST_DATA, TEST_DATA_2 } from '@core/core.module.spec';
import { HttpService, Observable } from '@shared/services/http/http.service';
import { RecordRepo, RecordResponse } from '@shared/services/api/record.repo';
import {
  SimpleVO,
  AccountPasswordVO,
  AccountVO,
  ArchiveVO,
  RecordVO,
} from '@root/app/models';
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
    const testRecord = new RecordVO({
      recordId: 1,
      displayName: 'Updated Test',
      parentFolderId: 2,
      uploadFileName: 'updated.jpg',
      size: 4321,
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
    expect(req.request.body).toEqual({
      ...testRecord,
      archiveId,
    });

    req.flush(testRecord);
  });
});
