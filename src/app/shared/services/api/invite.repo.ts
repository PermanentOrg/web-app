import { InviteVO, RecordVO, FolderVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';

export class InviteRepo extends BaseRepo {
  public send(invites: InviteVO[]): Promise<InviteResponse> {
    const data = invites.map((invite) => {
      return {
        InviteVO: invite
      };
    });

    return this.http.sendRequestPromise('/invite/inviteSend', data, InviteResponse);
  }

  public sendShareInvite(invites: InviteVO[], itemToShare: FolderVO | RecordVO): Promise<InviteResponse> {
    const data = invites.map((invite) => {
      const vos: any = {
        InviteVO: invite
      };

      if (itemToShare.isRecord) {
        vos.RecordVO = itemToShare;
      } else {
        vos.FolderVO = itemToShare;
      }

      return vos;
    });

    return this.http.sendRequestPromise('/invite/share', data, InviteResponse);
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
