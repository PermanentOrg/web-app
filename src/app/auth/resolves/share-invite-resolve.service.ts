import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { RecordVOData, FolderVOData, RecordVO, FolderVO } from '@models';

@Injectable()
export class ShareInviteResolveService  {

  constructor(private apiService: ApiService) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    if (!route.queryParams.shid) {
      return Promise.resolve(null);
    }

    const params = route.queryParams;

    let name, email, inviteCode;

    if (params.fullName) {
      name = window.atob(params.fullName);
    }

    if (params.primaryEmail) {
      email = window.atob(params.primaryEmail);
    }

    if (params.inviteCode) {
      inviteCode = window.atob(params.inviteCode);
    }

    return this.apiService.invite.getShareInviteInfo(email, inviteCode, params.shid, params.tp)
      .then(response => {
        try {
          const responseData = response.getResultsData()[0][0];
          return Promise.resolve(responseData);
        } catch (err) {
          return Promise.resolve(null);
        }
      });
  }
}
