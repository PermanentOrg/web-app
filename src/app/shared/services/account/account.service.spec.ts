import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { last } from 'rxjs/operators';
import { concat } from 'rxjs';

import { AccountService } from './account.service';
import { TEST_DATA } from '../../../core/core.module.spec';
import { AuthResponse } from '../api/auth.repo';
import { AccountVO, ArchiveVO } from '../../../models';
import { environment } from '../../../../environments/environment';

describe('AccountService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [AccountService]
    });

    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with no account or archive data', inject([AccountService], (service: AccountService) => {
    expect(service.getAccount()).toBeUndefined();
    expect(service.getArchive()).toBeUndefined();
  }));

  it('should log in to an account', inject([AccountService], (service: AccountService) => {
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
  }));

  it('should detect failed login due to MFA', inject([AccountService], (service: AccountService) => {
    service.logIn(TEST_DATA.user.email, TEST_DATA.user.password, true, true)
      .then((response: AuthResponse) => {
        expect(response.isSuccessful).toBeFalsy();
        expect(response.needsMFA()).toBeTruthy();
      });

    const expected = new AuthResponse({isSuccessful: false});
    expected.setMessage(['warning.auth.mfaToken', 'sms']);

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(expected);
  }));

  it('should verify MFA', inject([AccountService], (service: AccountService) => {
    service.setAccount(new AccountVO(TEST_DATA.account));

    service.verifyMfa('1111')
      .then((response: AuthResponse) => {
        expect(response.isSuccessful).toBeTruthy();
        expect(service.getAccount().accountId).toEqual(TEST_DATA.account.accountId);
      });

    const expected = new AuthResponse({isSuccessful: true});
    expected.setData([{
      AccountVO: new AccountVO(TEST_DATA.account),
    }]);

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/verify`);
    req.flush(expected);
  }));

  it('should log out of an account', inject([AccountService], (service: AccountService) => {
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
  }));
});
