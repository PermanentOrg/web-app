/* @format */
import { TestBed, inject } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { AccountRepo } from '@shared/services/api/account.repo';
import { AccountVO } from '@root/app/models';

describe('AccountRepo', () => {
  let repo: AccountRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });

    repo = new AccountRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
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
        true
      )
      .subscribe((response) =>
        expect(response.primaryEmail).toEqual('test@permanent.org')
      );
    const req = httpMock.expectOne(`${environment.apiUrl}/account/post`);
    req.flush(expected);
  });
});
