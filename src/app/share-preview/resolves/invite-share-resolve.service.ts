import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { InviteResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';

@Injectable()
export class InviteShareResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private account: AccountService,
    private message: MessageService,
    private router: Router
  ) { }

  async resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    if (this.account.isLoggedIn()) {
      await this.account.logOut();
    }

    return this.api.invite.getFullShareInvite(route.params.inviteCode)
      .then((response: InviteResponse): any => {
        if (response.isSuccessful) {
          const inviteVO = response.getInviteVO();
          return inviteVO;
        } else {
          throw response;
        }
      })
      .catch((response: InviteResponse) => {
        if (response.getMessage) {
          this.message.showError(response.getMessage(), true);
        }
        return this.router.navigate(['share', 'error']);
      });
  }
}
