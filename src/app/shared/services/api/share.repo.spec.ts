import { TestBed, inject } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { TEST_DATA, TEST_DATA_2 } from '@core/core.module.spec';
import { HttpService, Observable } from '@shared/services/http/http.service';
import { ShareRepo, ShareResponse } from '@shared/services/api/share.repo';
import {
  SimpleVO,
  AccountPasswordVO,
  AccountVO,
  ArchiveVO,
  FolderVO,
  RecordVO,
  ItemVO,
} from '@root/app/models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ShareRepo', () => {
  let repo: ShareRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [HttpService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    repo = new ShareRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns the correct number of ArchiveVOs', () => {
    const expected = require('@root/test/responses/share.getShares.success.json');
    repo.getShares().then((response: ShareResponse) => {
      expect(response.getShareArchiveVOs().length).toEqual(
        expected.Results[0].data.length,
      );
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/share/getShares`);
    req.flush(expected);
  });

  it('initializes ItemVOs on getShareArchiveVOs', () => {
    const expected = require('@root/test/responses/share.getShares.success.json');
    repo.getShares().then((response: ShareResponse) => {
      const shareArchive = response.getShareArchiveVOs()[0] as ArchiveVO;
      shareArchive.ItemVOs.forEach((item: ItemVO) => {
        if (item.type.includes('folder')) {
          expect(item.isFolder).toBeTruthy();
        } else {
          expect(item.isRecord).toBeTruthy();
        }
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/share/getShares`);
    req.flush(expected);
  });
});
