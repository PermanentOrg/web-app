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
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('AccountRepo', () => {
  let repo: AccountRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });

    repo = new AccountRepo(
      TestBed.inject(HttpService),
      TestBed.inject(HttpV2Service)
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
        true
      )
      .subscribe((response) => {
        expect(response.primaryEmail).toEqual('test@permanent.org');
      });
    const req = httpMock.expectOne(`${environment.apiUrl}/account/post`);

    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Request-Version')).toBe('2');
    req.flush(expected);
  });
});
