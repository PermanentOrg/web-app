import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { TEST_DATA, TEST_DATA_2 } from '@core/core.module.spec';
import { HttpService, Observable } from '@shared/services/http/http.service';
import { ArchiveRepo, ArchiveResponse } from '@shared/services/api/archive.repo';
import { SimpleVO, AccountPasswordVO, AccountVO, ArchiveVO } from '@root/app/models';

describe('ArchiveRepo', () => {
  let repo: ArchiveRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [HttpService]
    });

    repo = new ArchiveRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get a single archive', () => {
    const expected = require('@root/test/responses/archive.get.single.success.json');

    repo.get([TEST_DATA.archive.archiveId])
    .then((response) => {
      expect(response.getArchiveVO().archiveId).toEqual(TEST_DATA.archive.archiveId);
      expect(response.getArchiveVO().archiveNbr).toEqual(TEST_DATA.archive.archiveNbr);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/archive/get`);
    req.flush(expected);
  });

  it('should get multiple archives', () => {
    const expected = require('@root/test/responses/archive.get.multiple.success.json');

    repo.get([TEST_DATA.archive.archiveId, TEST_DATA_2.archive.archiveId])
    .then((response) => {
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
    repo.getAllArchives(new AccountVO(TEST_DATA.account))
    .then((response: ArchiveResponse) => {
      const archives = response.getArchiveVOs();
      const count = expected.Results[0].data.length;
      expect(archives.length).toBe(count);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/archive/getAllArchives`);
    req.flush(expected);
  });
});
