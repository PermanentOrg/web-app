import { TestBed, inject } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { TEST_DATA, TEST_DATA_2 } from '@core/core.module.spec';
import { HttpService, Observable } from '@shared/services/http/http.service';
import { FolderRepo, FolderResponse } from '@shared/services/api/folder.repo';
import {
  SimpleVO,
  AccountPasswordVO,
  AccountVO,
  ArchiveVO,
} from '@root/app/models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('FolderRepo', () => {
  let repo: FolderRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [HttpService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    repo = new FolderRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
