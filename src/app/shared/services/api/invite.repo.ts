/* @format */
import {
  InviteVO,
  RecordVO,
  FolderVO,
  AccountVO,
  ArchiveVO,
  ItemVO,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';
import { firstValueFrom } from 'rxjs';

export class InviteRepo extends BaseRepo {
  public async send(invite: InviteVO, archive: ArchiveVO): Promise<any> {
    const data = {
      email: invite.email,
      fullName: invite.fullName,
      relationship: invite.relationship,
      byArchiveId: archive.archiveId,
    };

    return await firstValueFrom(
      this.httpV2.post('/invite/inviteSend', data, null),
    );
  }

  public sendMemberInvite(
    member: AccountVO,
    archive: ArchiveVO,
  ): Promise<InviteResponse> {
    const data = [
      {
        InviteVO: {
          accessRole: member.accessRole,
          byArchiveId: archive.archiveId,
          email: member.primaryEmail,
          fullName: member.fullName,
          type: 'type.invite.archive',
        },
      },
    ];

    return this.http.sendRequestPromise<InviteResponse>(
      '/invite/byEmailAddress',
      data,
      { responseClass: InviteResponse },
    );
  }

  public sendShareInvite(invites: InviteVO[], itemToShare: ItemVO) {
    const data = invites.map((invite) => {
      const vos: any = {
        InviteVO: invite,
      };

      if (itemToShare.isRecord) {
        vos.RecordVO = itemToShare;
      } else {
        vos.FolderVO = itemToShare;
      }

      return vos;
    });

    return this.http.sendRequestPromise<InviteResponse>('/invite/share', data);
  }

  public getShareInviteInfo(
    inviteEmail: string,
    inviteCode: string,
    shareItemId: number,
    shareItemType: 'r' | 'f',
  ) {
    const data = [
      {
        primaryEmail: inviteEmail,
        inviteCode: inviteCode,
        shid: shareItemId,
        tp: shareItemType,
      },
    ];

    return this.http.sendRequestPromise<InviteResponse>(
      '/invite/getShareInviteInfo',
      data,
      { responseClass: InviteResponse },
    );
  }

  public getFullShareInvite(token: string) {
    const data = [
      {
        token,
      },
    ];

    return this.http.sendRequestPromise<InviteResponse>(
      '/invite/getFullShareInvite',
      data,
      { responseClass: InviteResponse },
    );
  }

  public getInvites() {
    return this.http.sendRequestPromise<InviteResponse>(
      '/invite/getMyInvites',
      [{}],
      { responseClass: InviteResponse },
    );
  }

  public resendInvites(invites: InviteVO[]) {
    const data = invites.map((invite) => {
      return {
        InviteVO: invite,
      };
    });

    return this.http.sendRequestPromise<InviteResponse>(
      '/invite/inviteResend',
      data,
      { responseClass: InviteResponse },
    );
  }
}

export class InviteResponse extends BaseResponse {
  public getInviteVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new InviteVO(data[0][0].InviteVO);
  }

  public getInviteVOs() {
    const data = this.getResultsData();
    const invites = data.map((result) => {
      return result.map((resultList) => {
        return resultList.InviteVO;
      });
    });

    return flatten(invites);
  }
}
