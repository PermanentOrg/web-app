import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

import { TEST_DATA, TEST_DATA_2 } from '../../../core/core.module.spec';
import { HttpService, Observable } from '../http/http.service';
import { RecordRepo, RecordResponse } from './record.repo';
import { SimpleVO, AccountPasswordVO, AccountVO, ArchiveVO } from '@models/index';

describe('RecordRepo', () => {
  let repo: RecordRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [HttpService]
    });

    repo = new RecordRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

});
