import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { ArchiveResponse, ShareResponse } from '@shared/services/api/index.repo';
import { RecordVO, ArchiveVO } from '@models/index';

@Injectable()
export class ShareUrlResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    return this.api.share.checkShareLink(route.params.shareToken)
      .then((response: ShareResponse) => {
        console.log(response);
        if (response.isSuccessful) {
          return response.getShareByUrlVO();
        } else {
          throw response;
        }
      })
      .catch((response: ShareResponse) => {
        if (response.getMessage) {
          this.message.showError(response.getMessage(), true);
        }
        return this.router.navigate(['p', 'error']);
      });
  }
}
