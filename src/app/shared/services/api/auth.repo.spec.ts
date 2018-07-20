import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';

import { HttpService } from '../http/http.service';
import { AuthRepo, AuthResponse } from './auth.repo';
import { SimpleVO, AccountPasswordVO, AccountVO, ArchiveVO } from '@models/index';

describe('AuthRepo', () => {
  let repo: AuthRepo;
  let httpMock: HttpTestingController;

  const testUser = {
    email: 'tstr@permanent.org',
    password: 'Abc123!!!',
    name: 'Test Account',
    rememberMe: true
  };

  const testAccount = {
    accountId: 1,
    primaryEmail: testUser.email,
    fullName: testUser.name
  };

  const testArchive = {
    archiveId: 1,
    fullName: testUser.name
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [HttpService]
    });

    repo = new AuthRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should check logged in status', () => {
    const returnData = [{
      SimpleVO: new SimpleVO({
        key: 'bool',
        value: true
      })
    }];

    const expected = new AuthResponse({isSuccessful: true});
    expected.setData(returnData);

    repo.isLoggedIn()
    .subscribe(response => {
      expect(response).toEqual(expected);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/loggedIn`);
    req.flush(expected);
  });

  it('should log in', () => {
    const data = [{
      AccountPasswordVO: new AccountPasswordVO({password: testUser.password}),
      AccountVO: new AccountVO({primaryEmail: testUser.email, rememberMe: testUser.rememberMe})
    }];

    const returnData = [{
      AccountVO: new AccountVO(testAccount),
      ArchiveVO: new ArchiveVO(testArchive)
    }];

    const expected = new AuthResponse({isSuccessful: true});
    expected.setData(returnData);

    repo.logIn(testUser.email, testUser.password, testUser.rememberMe, true)
    .subscribe(response => {
      expect(response).toEqual(expected);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(expected);
  });

  it('should send a forgot password email', () => {
    const expected = require ('@root/test/responses/auth.forgotPassword.success.json');

    repo.forgotPassword(testUser.email)
    .subscribe((response: AuthResponse) => {
      expect(response.isSuccessful).toBeTruthy();
      expect(response.getMessage()).toEqual('Change Password URL sent to email address provided');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/sendEmailForgotPassword`);
    req.flush(expected);
  });
});
