/* @format */
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { TagVO } from '@models/tag-vo';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { SearchRepo, SearchResponse } from './search.repo';
import { buildUrlWithParams } from './test-utils';

const apiUrl = (endpoint: string) => `${environment.apiUrl}/${endpoint}`;

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

  it('should include tags in the query string when tags are provided', () => {
    const tags = [
      new TagVO({ tagId: 1, name: 'Tag1' }),
      new TagVO({ tagId: 2, name: 'Tag2' }),
    ];
    const query = 'exampleQuery';
    const archiveId = '1';
    const limit = 5;

    const expectedUrl = buildUrlWithParams(apiUrl('search/folderAndRecord'), {
      query: 'exampleQuery',
      archiveId: '1',
      publicOnly: true,
      tags: [{ tagId: 1 }, { tagId: 2 }],
      numberOfResults: 5,
    });

    repo
      .itemsByNameInPublicArchiveObservable(query, tags, archiveId, limit)
      .toPromise()
      .then((response: SearchResponse) => {
        expect(response).toBeTruthy();
      });

    const req = httpMock.expectOne((req) =>
      req.url.includes('/search/folderAndRecord'),
    );

    expect(req.request.method).toBe('GET');

    expect(req.request.urlWithParams).toContain(expectedUrl);

    req.flush({});
  });

  it('should exclude tags from the query string when no tags are provided', () => {
    const query = 'exampleQuery';
    const archiveId = '1';
    const limit = 3;

    repo
      .itemsByNameInPublicArchiveObservable(query, [], archiveId, limit)
      .toPromise()
      .then((response: SearchResponse) => {
        expect(response).toBeTruthy();
      });

    const req = httpMock.expectOne((req) =>
      req.url.includes('/search/folderAndRecord'),
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams).not.toContain('tags');
    expect(req.request.urlWithParams).toContain(
      `query=${query}&archiveId=${archiveId}&publicOnly=true&numberOfResults=${limit}`,
    );

    req.flush({});
  });

  it('should exclude numberOfResults from the query string when no limit is provided', () => {
    const query = 'exampleQuery';
    const archiveId = '1';

    repo
      .itemsByNameInPublicArchiveObservable(query, [], archiveId)
      .toPromise()
      .then((response: SearchResponse) => {
        expect(response).toBeTruthy();
      });

    const req = httpMock.expectOne((req) =>
      req.url.includes('/search/folderAndRecord'),
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams).toContain(
      `query=${query}&archiveId=${archiveId}&publicOnly=true`,
    );

    req.flush({});
  });

  it('should fetch tags for a valid archive ID', () => {
    const archiveId = '1';
    const expectedTags = [
      new TagVO({ tagId: 1, name: 'Tag1' }),
      new TagVO({ tagId: 2, name: 'Tag2' }),
    ];

    repo.getPublicArchiveTags(archiveId).subscribe((tags) => {
      expect(tags).toEqual(expectedTags);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/v2/archive/${archiveId}/tags/public`,
    );

    expect(req.request.method).toBe('GET');

    req.flush(expectedTags);
  });

  it('should handle errors when fetching tags for an invalid archive ID', () => {
    const archiveId = 'invalid-id';

    repo.getPublicArchiveTags(archiveId).subscribe(
      () => fail('should have failed with a 404 error'),
      (error) => {
        expect(error.status).toBe(404);
      },
    );

    const req = httpMock.expectOne(
      `${environment.apiUrl}/v2/archive/${archiveId}/tags/public`,
    );

    expect(req.request.method).toBe('GET');

    req.flush(
      { message: 'Not Found' },
      { status: 404, statusText: 'Not Found' },
    );
  });
});
