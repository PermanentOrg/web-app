import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { DeviceService } from '@shared/services/device/device.service';
import { AccountService } from '@shared/services/account/account.service';

import {
  ArchiveResponse,
  ShareResponse,
} from '@shared/services/api/index.repo';
import { RecordVO, ArchiveVO, FolderVO } from '@models';

@Injectable()
export class ShareUrlResolveService {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router,
    private device: DeviceService,
    private accountService: AccountService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.api.share
      .checkShareLink(route.params.shareToken)
      .then((response: ShareResponse): any => {
        if (response.isSuccessful) {
          const shareByUrlVO = response.getShareByUrlVO();

          return shareByUrlVO;
        } else {
          throw response;
        }
      })
      .catch((response: ShareResponse) => {
        if (response.getMessage) {
          if (response.messageIncludes('warning.auth.mfaToken')) {
            this.accountService.setRedirect([
              '/share',
              route.params.shareToken,
            ]);
            return this.router.navigate(['/app', 'auth', 'mfa']);
          } else {
            this.message.showError({
              message: response.getMessage(),
              translate: true,
            });
          }
        }
        return this.router.navigate(['share', 'error']);
      });
  }
}
