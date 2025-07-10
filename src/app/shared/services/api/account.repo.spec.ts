/* @format */
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';
import { HttpService } from '@shared/services/http/http.service';
import { AccountRepo } from '@shared/services/api/account.repo';
import { AccountVO } from '@root/app/models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('AccountRepo', () => {
  let repo: AccountRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [HttpService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    repo = new AccountRepo(
      TestBed.inject(HttpService),
      TestBed.inject(HttpV2Service),
    );
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('signUp should call /account/post', () => {
    const expected = new AccountVO({
      primaryEmail: 'test@permanent.org',
      fullName: 'Test User',
    });

    repo
      .signUp(
        'test@permanent.org',
        'Test User',
        'password123',
        'password123',
        true,
        true,
        true,
      )
      .subscribe((response) => {
        expect(response.primaryEmail).toEqual('test@permanent.org');
      });
    const req = httpMock.expectOne(`${environment.apiUrl}/account/post`);

    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    req.flush(expected);
  });

  it('update should call v2 of /account/update', (done) => {
    const update = {
      primaryEmail: 'test@example.com',
      fullName: 'Dr. Test User',
    };

    repo
      .update(update)
      .then((account) => {
        expect(account).toBeInstanceOf(AccountVO);
        expect(account.fullName).toBe(update.fullName);
      })
      .catch(() => {
        done.fail();
      })
      .finally(() => done());

    const req = httpMock.expectOne(`${environment.apiUrl}/account/update`);

    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    req.flush(update);
  });

  it('should map the `zip` propety to `postalCode` when calling /account/update', (done) => {
    const update = {
      primaryEmail: 'test@example.com',
      zip: '12345',
    };

    repo.update(update).finally(() => done());

    const req = httpMock.expectOne(`${environment.apiUrl}/account/update`);

    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    expect(req.request.body.zip).toBeUndefined();
    expect(req.request.body.postalCode).toBe('12345');
    req.flush(update);
  });
});
