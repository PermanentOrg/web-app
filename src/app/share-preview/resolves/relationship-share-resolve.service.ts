import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { ShareResponse } from '@shared/services/api/index.repo';
import { ShareVO } from '@models/index';

@Injectable()
export class RelationshipShareResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    return this.api.share.getShareForPreview(route.params.shareId, route.params.folder_linkId)
      .then((response: ShareResponse): any => {
        if (response.isSuccessful) {
          return response.getShareVO();
        } else {
          throw response;
        }
      })
      .catch((response: ShareResponse) => {
        if (response.getMessage) {
          this.message.showError(response.getMessage(), true);
        }
        return this.router.navigate(['share', 'error']);
      });
  }
}
