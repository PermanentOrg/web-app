import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { TEST_DATA, TEST_DATA_2 } from '@core/core.module.spec';
import { HttpService, Observable } from '@shared/services/http/http.service';
import { FolderRepo, FolderResponse } from '@shared/services/api/folder.repo';
import { SimpleVO, AccountPasswordVO, AccountVO, ArchiveVO } from '@root/app/models';

describe('FolderRepo', () => {
  let repo: FolderRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [HttpService]
    });

    repo = new FolderRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

});
