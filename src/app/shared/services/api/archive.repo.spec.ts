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
    .subscribe((response) => {
      expect(response.getArchiveVO().archiveId).toEqual(TEST_DATA.archive.archiveId);
      expect(response.getArchiveVO().archiveNbr).toEqual(TEST_DATA.archive.archiveNbr);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/archive/get`);
    req.flush(expected);
  });

  it('should get multiple archives', () => {
    const expected = require('@root/test/responses/archive.get.multiple.success.json');

    repo.get([TEST_DATA.archive.archiveId, TEST_DATA_2.archive.archiveId])
    .subscribe((response) => {
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
});
