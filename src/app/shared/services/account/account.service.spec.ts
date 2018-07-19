import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

import { last } from 'rxjs/operators';
import { concat } from 'rxjs';

import { AccountService } from './account.service';
import { TEST_DATA } from '../../../core/core.module.spec';
import { AuthResponse } from '../api/auth.repo';
import { AccountVO, ArchiveVO } from '@models/index';
import { environment } from '../../../../environments/environment';
import { AccountResponse } from '../api/index.repo';

describe('AccountService', () => {
  let httpMock: HttpTestingController;
  let service: AccountService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CookieService,
        AccountService
      ]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(AccountService);
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('should be created with no account or archive data', () => {
    expect(service.getAccount()).toBeUndefined();
    expect(service.getArchive()).toBeUndefined();
  });

  it('should log in to an account', () => {
    service.logIn(TEST_DATA.user.email, TEST_DATA.user.password, true, true)
      .then((response: AuthResponse) => {
        const responseArchive = response.getArchiveVO();
        const responseAccount = response.getAccountVO();
        expect(response.isSuccessful).toBeTruthy();

        expect(responseAccount.accountId).toEqual(TEST_DATA.account.accountId);
        expect(responseArchive.archiveId).toEqual(TEST_DATA.archive.archiveId);

        expect(service.getAccount().accountId).toEqual(TEST_DATA.account.accountId);
        expect(service.getArchive().archiveId).toEqual(TEST_DATA.archive.archiveId);
      });

    const expected = new AuthResponse({isSuccessful: true});
    expected.setData([{
      AccountVO: new AccountVO(TEST_DATA.account),
      ArchiveVO: new ArchiveVO(TEST_DATA.archive)
    }]);

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(expected);
  });

  it('should detect need to verify MFA after login', () => {
    const expected = require('../../../../test/responses/auth.login.verifyMfa.json');

    service.logIn(TEST_DATA.user.email, TEST_DATA.user.password, true, true)
      .then((response: AuthResponse) => {
        expect(response.isSuccessful).toBeFalsy();

        expect(response.needsMFA()).toBeTruthy();
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(expected);
  });

  it('should verify MFA', () => {
    const expected = require('../../../../test/responses/auth.signup.duplicate.json');

    service.setAccount(new AccountVO(TEST_DATA.account));

    service.verifyMfa('1111')
      .then((response: AuthResponse) => {
        expect(response.isSuccessful).toBeTruthy();

        expect(service.getAccount().accountId).toEqual(TEST_DATA.account.accountId);
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/verify`);
    req.flush(expected);
  });

  it('should detect need to verify email after login', () => {
    const expected = require('../../../../test/responses/auth.login.verifyEmail.json');

    service.logIn(TEST_DATA.user.email, TEST_DATA.user.password, true, true)
      .then((response: AuthResponse) => {
        expect(response.isSuccessful).toBeFalsy();
        expect(response.needsVerification()).toBeTruthy();
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(expected);
  });

  it('should log out of an account', () => {
    service.setAccount(new AccountVO(TEST_DATA.account));
    service.setArchive(new ArchiveVO(TEST_DATA.archive));

    service.logOut()
      .then((response: AuthResponse) => {
          expect(response.isSuccessful).toBeTruthy();

          expect(service.getAccount()).toBeUndefined();
          expect(service.getArchive()).toBeUndefined();
      });

    const expected = new AuthResponse({isSuccessful: true});

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    req.flush(expected);
  });

  it('should sign up for an account', () => {
    const expected = require('../../../../test/responses/auth.signup.success.json');

    service.signUp(TEST_DATA.user.email, TEST_DATA.user.name, TEST_DATA.user.password, TEST_DATA.user.password,
      true, true, null, 'Permanent Archive')
      .then((response: AccountResponse) => {
        const responseAccount = response.getAccountVO();
        const serviceAccount = service.getAccount();

        expect(response.isSuccessful).toBeTruthy();

        expect(responseAccount.accountId).toEqual(TEST_DATA.account.accountId);
        expect(serviceAccount.accountId).toEqual(TEST_DATA.account.accountId);

        expect(service.getArchive()).toBeFalsy();

        expect(response.needsVerification()).toBeTruthy();
        expect(responseAccount.needsVerification()).toBeTruthy();
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/account/post`);
    req.flush(expected);
  });

  it('should trigger catch on failed signup', () => {
    const expected = require('../../../../test/responses/auth.signup.duplicate.json');

    service.signUp(TEST_DATA.user.email, TEST_DATA.user.name, TEST_DATA.user.password, TEST_DATA.user.password,
      true, true, null, 'Permanent Archive')
      .then((response: AccountResponse) => {
        fail();
      })
      .catch((response: AccountResponse) => {
        expect(response.isSuccessful).toBeFalsy();
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/account/post`);
    req.flush(expected);
  });
});
