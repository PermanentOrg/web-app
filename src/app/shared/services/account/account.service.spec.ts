import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

import { last } from 'rxjs/operators';
import { concat } from 'rxjs';

import { AccountService } from '@shared/services/account/account.service';
import { TEST_DATA } from '@core/core.module.spec';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { AccountVO, ArchiveVO } from '@root/app/models';
import { environment } from '@root/environments/environment';
import { AccountResponse } from '@shared/services/api/index.repo';
import { StorageService } from '@shared/services/storage/storage.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AccountService', () => {
  let httpMock: HttpTestingController;
  let service: AccountService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        CookieService,
        AccountService,
        StorageService
      ]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(AccountService);
    storageService = TestBed.get(StorageService);

    storageService.local.clear();
    storageService.session.clear();
  });

  afterEach(() => {
    httpMock.verify();
    storageService.local.clear();
    storageService.session.clear();
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
    const expected = require('@root/test/responses/auth.login.verifyMfa.json');

    service.logIn(TEST_DATA.user.email, TEST_DATA.user.password, true, true)
      .then((response: AuthResponse) => {
        expect(response.isSuccessful).toBeFalsy();

        expect(response.needsMFA()).toBeTruthy();
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(expected);
  });

  it('should verify MFA', () => {
    const expected = require('@root/test/responses/auth.verify.success.json');

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
    const expected = require('@root/test/responses/auth.login.verifyEmail.json');

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
    const expected = require('@root/test/responses/auth.signup.success.json');

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
    const expected = require('@root/test/responses/auth.signup.duplicate.json');

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
