import { TestBed, inject } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { FolderRepo } from '@shared/services/api/folder.repo';
import { FolderVO } from '@root/app/models';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('FolderRepo', () => {
  let repo: FolderRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });

    repo = new FolderRepo(
      TestBed.inject(HttpService),
      TestBed.inject(HttpV2Service),
    );
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get with children successfully', async () => {
    const inputFolder = new FolderVO({ archiveId: 1, folderId: 1 });

    const mockResponse = new FolderVO({
      archiveId: 1,
      folderId: 1,
      isFolder: true,
      displayName: 'Test Folder',
      ChildItemVOs: [],
    });

    const promise = repo.getWithChildren([inputFolder]);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/folder/getWithChildren?archiveId=1&folderId=1`,
    );
    req.flush([mockResponse]);

    const result = await promise;

    expect(result).toEqual(mockResponse);
  });
});
