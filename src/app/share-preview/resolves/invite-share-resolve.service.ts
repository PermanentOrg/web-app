import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { InviteResponse } from '@shared/services/api/index.repo';

@Injectable()
export class InviteShareResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    console.log('finna resolve');
    return this.api.invite.getFullShareInvite(route.params.inviteCode)
      .then((response: InviteResponse): any => {
        if (response.isSuccessful) {
          const inviteVO = response.getInviteVO();

          console.log(inviteVO);
          return inviteVO;
        } else {
          throw response;
        }
      })
      .catch((response: InviteResponse) => {
        if (response.getMessage) {
          this.message.showError(response.getMessage(), true);
        }
        // return this.router.navigate(['share', 'error']);
      });
  }
}
