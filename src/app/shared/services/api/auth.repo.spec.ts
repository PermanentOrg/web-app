/* @format */
import { TestBed, inject } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { map } from 'rxjs/operators';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { AuthRepo, AuthResponse } from '@shared/services/api/auth.repo';
import {
  SimpleVO,
  AccountPasswordVO,
  AccountVO,
  ArchiveVO,
} from '@root/app/models';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('AuthRepo', () => {
  let repo: AuthRepo;
  let httpMock: HttpTestingController;

  const testUser = {
    email: 'tstr@permanent.org',
    password: 'Abc123!!!',
    name: 'Test Account',
    rememberMe: true,
  };

  const testAccount = {
    accountId: 1,
    primaryEmail: testUser.email,
    fullName: testUser.name,
  };

  const testArchive = {
    archiveId: 1,
    fullName: testUser.name,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        HttpService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    repo = new AuthRepo(
      TestBed.inject(HttpService),
      TestBed.inject(HttpV2Service),
    );
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should check logged in status', () => {
    const returnData = [
      {
        SimpleVO: new SimpleVO({
          key: 'bool',
          value: true,
        }),
      },
    ];

    const expected = new AuthResponse({ isSuccessful: true });
    expected.setData(returnData);

    repo.isLoggedIn().then((response) => {
      expect(response).toEqual(expected);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/loggedIn`);
    req.flush(expected);
  });

  it('should log in', () => {
    const data = [
      {
        AccountPasswordVO: new AccountPasswordVO({
          password: testUser.password,
        }),
        AccountVO: new AccountVO({
          primaryEmail: testUser.email,
          rememberMe: testUser.rememberMe,
        }),
      },
    ];

    const returnData = [
      {
        AccountVO: new AccountVO(testAccount),
        ArchiveVO: new ArchiveVO(testArchive),
        SimpleVO: new SimpleVO({ value: 'test_token' }),
      },
    ];

    const expected = new AuthResponse({ isSuccessful: true });
    expected.setData(returnData);

    repo
      .logIn(testUser.email, testUser.password, testUser.rememberMe, true)
      .pipe(
        map((response) => {
          repo.httpV2.setAuthToken(response.getSimpleVO().value);
          return response;
        }),
      )
      .subscribe((response) => {
        expect(response).toEqual(expected);
        repo.httpV2
          .get('/v2/health', {}, Object, { useStelaDomain: false })
          .toPromise();
        const req2 = httpMock.expectOne(`${environment.apiUrl}/v2/health`);

        expect(req2.request.headers.get('Authorization')).toBe(
          'Bearer test_token',
        );
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(expected);
  });

  it('should send a forgot password email', () => {
    const expected = require('@root/test/responses/auth.forgotPassword.success.json');

    repo.forgotPassword(testUser.email).subscribe((response: AuthResponse) => {
      expect(response.isSuccessful).toBeTruthy();
      expect(response.getMessage()).toEqual(
        'Change Password URL sent to email address provided',
      );
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/sendEmailForgotPassword`,
    );
    req.flush(expected);
  });

  it('should send an update password "V1" request', () => {
    repo.updatePassword(new AccountVO(testAccount), {
      passwordOld: 'oldpass',
      password: 'newpass',
      passwordVerify: 'newpass',
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/account/changePassword`,
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Request-Version')).toBeFalse();
    req.flush({
      isSuccessful: true,
      isSystemUp: true,
      csrf: 'csrf',
    });
  });

  it('should be able to send an update password V2 request with trust token', () => {
    repo.updatePassword(
      new AccountVO(testAccount),
      {
        passwordOld: 'oldpass',
        password: 'newpass',
        passwordVerify: 'newpass',
      },
      'trust_token',
    );

    const req = httpMock.expectOne(
      `${environment.apiUrl}/account/changePassword`,
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    req.flush({});
  });
});
