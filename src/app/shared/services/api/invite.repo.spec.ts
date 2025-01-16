import { TestBed, inject } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { InviteRepo, InviteResponse } from '@shared/services/api/invite.repo';
import { InviteVO } from '@root/app/models';

describe('InviteRepo', () => {
  let repo: InviteRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });

    repo = new InviteRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send a single invite', () => {
    const expected = require('@root/test/responses/invite.inviteSend.single.success.json');

    const invite = new InviteVO({
      fullName: 'Test Invite',
      email: 'testinvite@gmail.com',
    });

    repo.send([invite]).then((response: InviteResponse) => {
      expect(response.isSuccessful).toBeTruthy();
      expect(response.getInviteVO().fullName).toEqual('Test Invite');
      expect(response.getInviteVO().email).toEqual('testinvite@gmail.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/invite/inviteSend`);
    req.flush(expected);
  });
});
