import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import { InviteRepo, InviteResponse } from '@shared/services/api/invite.repo';
import {
  AccessRole,
  AccountVO,
  ArchiveVO,
  InviteVO,
  RecordVO,
} from '@root/app/models';
import { AccessRoleType } from '@models/access-role';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('InviteRepo', () => {
  let repo: InviteRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });

    repo = new InviteRepo(
      TestBed.inject(HttpService),
      TestBed.inject(HttpV2Service),
    );
    httpMock = TestBed.inject(HttpTestingController);
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

  it('should send a member invite successfully', async () => {
    const expectedResponse = {
      accessRole: 'ADMIN',
      byArchiveId: 123,
      email: 'testuser@gmail.com',
      fullName: 'Test User',
      type: 'type.invite.archive',
    };

    const member: AccountVO = new AccountVO({
      accessRole: AccessRole.Viewer as unknown as AccessRoleType,
      primaryEmail: 'testuser@gmail.com',
      fullName: 'Test User',
    });

    const archive = new ArchiveVO({
      archiveId: 123,
    });

    repo.sendMemberInvite(member, archive);

    const req = httpMock.expectOne(
      `${environment.apiUrl}/invite/byEmailAddress`,
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      accessRole: member.accessRole,
      byArchiveId: archive.archiveId,
      email: member.primaryEmail,
      fullName: member.fullName,
      type: 'type.invite.archive',
    });

    req.flush(expectedResponse);
  });
  it('should send a share invite successfully', () => {
    const mockResponse = {
      inviteId: 8,
      email: 'john.doe@gmail.com',
      byArchiveId: 123,
      byAccountId: 2,
      expiresDT: '2025-04-18T12:42:55',
      fullName: 'John Doe',
      message: null,
      relationship: 'relation.family.uncle',
      accessRole: 'access.role.viewer',
      timesSent: 1,
      giftSizeInMB: null,
      token: 'token',
      status: 'status.invite.pending',
      type: 'type.invite.share',
      FolderVO: null,
      RecordVO: null,
      ArchiveVO: null,
      AccountVO: null,
      InviteShareVO: null,
      ShareVO: null,
      createdDT: '2025-03-19T12:42:55',
      updatedDT: '2025-03-19T12:42:55',
      recordId: 789,
    };

    const invite = new InviteVO({
      fullName: 'John Doe',
      email: 'john.doe@gmail.com',
      byArchiveId: 123,
      accessRole: 'access.role.viewer',
      relationship: 'relation.family.uncle',
    });

    const itemToShare = new RecordVO({
      folder_linkId: 456,
      recordId: 789,
    });

    repo.sendShareInvite(invite, itemToShare).then((response) => {
      expect(response).toEqual([mockResponse]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/invite/share`);

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      email: 'john.doe@gmail.com',
      byArchiveId: 123,
      fullName: 'John Doe',
      accessRole: 'access.role.viewer',
      folderLinkId: 456,
      relationship: 'relation.family.uncle',
      recordId: 789,
    });

    req.flush(mockResponse);
  });
});
