/* @format */
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { SearchRepo, SearchResponse } from './search.repo';

describe('SearchRepo', () => {
  let repo: SearchRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });

    repo = new SearchRepo(
      TestBed.inject(HttpService),
      TestBed.inject(HttpV2Service),
    );
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns the correct search results', () => {
    const expected = require('@root/test/responses/search.get.publicFiles.success.json');
    repo
      .itemsByNameInPublicArchiveObservable('test', [], '1', 4)
      .toPromise()
      .then((response: SearchResponse) => {
        expect(JSON.stringify(response)).toEqual(JSON.stringify(expected[0]));
      });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/search/folderAndRecord?query=test&archiveId=1&publicOnly=true&numberOfResults=4`,
    );
    req.flush(expected);
  });
});
