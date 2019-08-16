import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { PublishResponse } from '@shared/services/api/index.repo';
import { RecordVO } from '@models/index';

@Injectable()
export class PreviewResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    return this.api.publish.getResource(route.params.shareToken)
      .then((response: PublishResponse): RecordVO | any => {
        if (response.getRecordVO()) {
          return response.getRecordVO();
        } else if (response.getFolderVO()) {
          return response.getFolderVO();
        } else {
          throw response;
        }
      })
      .catch((response: PublishResponse) => {
        if (response.getMessage) {
          this.message.showError(response.getMessage(), true);
        }
        return this.router.navigate(['p', 'error']);
      });
  }
}
