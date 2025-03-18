/* @format */
import {
  InviteVO,
  RecordVO,
  FolderVO,
  AccountVO,
  ArchiveVO,
  ItemVO,
  ShareVO,
  AccessRole,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';
import { firstValueFrom } from 'rxjs';

export class InviteRepo extends BaseRepo {
  public send(invites: InviteVO[]): Promise<InviteResponse> {
    const data = invites.map((invite) => {
      return {
        InviteVO: invite,
      };
    });

    return this.http.sendRequestPromise<InviteResponse>(
      '/invite/inviteSend',
      data,
      { responseClass: InviteResponse },
    );
  }

  public async sendMemberInvite(member: AccountVO, archive: ArchiveVO) {
    const data = {
      accessRole: member.accessRole,
      byArchiveId: archive.archiveId,
      email: member.primaryEmail,
      fullName: member.fullName,
      type: 'type.invite.archive',
    };

    return await firstValueFrom(
      this.httpV2.post('/invite/byEmailAddress', data, null),
    );
  }

  public sendShareInvite(
    invites: InviteVO[],
    itemToShare: ItemVO,
  ): Promise<InviteResponse> {
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

    return this.http.sendRequestPromise<InviteResponse>('/invite/share', data, {
      responseClass: InviteResponse,
    });
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
