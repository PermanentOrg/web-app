import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { environment } from '@root/environments/environment';
import { StelaItems } from '@root/utils/stela-items';
import { ShareLink } from '../models/share-link';
import { ShareLinksApiService } from './share-links-api.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ShareLinksApiService', () => {
  let service: ShareLinksApiService;
  let http: HttpTestingController;

  function makeShareLinks(quantity: number): ShareLink[] {
    return new Array(quantity).fill({
      id: '123',
      itemId: 'record-id',
      itemType: 'record',
      token: 'test-token',
      permissionsLevel: 'viewer',
      accessRestrictions: 'none',
      maxUses: null,
      usesExpended: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [HttpV2Service, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ShareLinksApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to get multiple share links by id', (done) => {
    const expectedShareLink: StelaItems<ShareLink> = {
      items: makeShareLinks(3),
    };

    service
      .getShareLinksById([123, 456, 789])
      .then((links) => {
        expect(links).toEqual(expectedShareLink.items);
        done();
      })
      .catch(() => {
        done.fail('Rejection in promise.');
      });

    const req = http.expectOne(
      `${environment.apiUrl}/v2/share-links?shareLinkIds[]=123&shareLinkIds[]=456&shareLinkIds[]=789`,
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    req.flush(expectedShareLink);
  });

  it('should handle a share link by id GET request error', (done) => {
    service
      .getShareLinksById([123])
      .then(() => {
        done.fail('This promise should have been rejected');
      })
      .catch(() => {
        done();
      });

    const req = http.expectOne(
      `${environment.apiUrl}/v2/share-links?shareLinkIds[]=123`,
    );

    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should get a share link by token', (done) => {
    const items: StelaItems<ShareLink> = { items: makeShareLinks(1) };
    service
      .getShareLinksByToken(['token-1', 'token-2', 'token-3'])
      .then((links) => {
        expect(links).toEqual(items.items);
        done();
      })
      .catch(() => done.fail);

    const req = http.expectOne(
      `${environment.apiUrl}/v2/share-links?shareTokens[]=token-1&shareTokens[]=token-2&shareTokens[]=token-3`,
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    req.flush(items);
  });

  it('should handle a share link by token GET request error', (done) => {
    service
      .getShareLinksByToken(['token'])
      .then(() => {
        done.fail('This promise should have been rejected');
      })
      .catch(() => {
        done();
      });

    const req = http.expectOne(
      `${environment.apiUrl}/v2/share-links?shareTokens[]=token`,
    );

    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should generate a share link', (done) => {
    const expectedResponse: ShareLink = {
      id: '7',
      itemId: '4',
      itemType: 'record',
      token: '971299ea-6732-4699-8629-34186a624e07',
      permissionsLevel: 'viewer',
      accessRestrictions: 'none',
      maxUses: null,
      usesExpended: null,
      expirationTimestamp: null,
      createdAt: new Date('2025-04-09T13:09:07.755Z'),
      updatedAt: new Date('2025-04-09T13:09:07.755Z'),
    };

    const mockApiResponse = {
      data: expectedResponse,
    };

    service
      .generateShareLink({ itemId: '1', itemType: 'record' })
      .then((res) => {
        expect(res).toEqual(expectedResponse);
        done();
      })
      .catch(() => {
        done.fail('Rejection in promise.');
      });

    const req = http.expectOne(`${environment.apiUrl}/v2/share-links`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ itemId: '1', itemType: 'record' });

    req.flush(mockApiResponse);
  });

  it('should handle a share link POST error', (done) => {
    service
      .generateShareLink({ itemId: '1', itemType: 'record' })
      .then(() => {
        done.fail('This promise should have been rejected');
      })
      .catch(() => {
        done();
      });

    const req = http.expectOne(`${environment.apiUrl}/v2/share-links`);

    req.flush(
      {},
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );
  });

  it('should handle a share link DELETE call', (done) => {
    service
      .deleteShareLink('7')
      .then(() => {
        done();
      })
      .catch(() => {
        done.fail('Rejection in promise.');
      });
    const req = http.expectOne(`${environment.apiUrl}/v2/share-links/7`);

    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Request-Version')).toBe('2');

    req.flush({}, { status: 204, statusText: 'No Content' });
  });

  it('should handle a share link DELETE error', (done) => {
    service
      .deleteShareLink('7')
      .then(() => {
        done.fail('This promise should have been rejected');
      })
      .catch(() => {
        done();
      });

    const req = http.expectOne(`${environment.apiUrl}/v2/share-links/7`);

    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Request-Version')).toBe('2');

    req.flush(
      {},
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );
  });

  it('should update a share link', (done) => {
    const expectedResponse: ShareLink = {
      id: '7',
      itemId: '4',
      itemType: 'record',
      token: '971299ea-6732-4699-8629-34186a624e07',
      permissionsLevel: 'viewer',
      accessRestrictions: 'account',
      maxUses: null,
      usesExpended: null,
      expirationTimestamp: null,
      createdAt: new Date('2025-04-09T13:09:07.755Z'),
      updatedAt: new Date('2025-04-09T13:09:07.755Z'),
    };

    const mockApiResponse = {
      data: expectedResponse,
    };

    service
      .updateShareLink('1', { accessRestrictions: 'account' })
      .then((res) => {
        expect(res).toEqual(expectedResponse);
        done();
      })
      .catch(() => {
        done.fail('Rejection in promise.');
      });
    const req = http.expectOne(`${environment.apiUrl}/v2/share-links/1`);

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ accessRestrictions: 'account' });

    req.flush(mockApiResponse);
  });

  it('should handle a share link PATCH error', (done) => {
    service
      .updateShareLink('7', { accessRestrictions: 'account' })
      .then(() => {
        done.fail('This promise should have been rejected');
      })
      .catch(() => {
        done();
      });

    const req = http.expectOne(`${environment.apiUrl}/v2/share-links/7`);

    expect(req.request.method).toBe('PATCH');
    expect(req.request.headers.get('Request-Version')).toBe('2');

    req.flush(
      {},
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );
  });
});
