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
import { RecordVO, ArchiveVO, FolderVO, AccountVO } from '@models';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';

@Injectable()
export class ShareUrlResolveService {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router,
    private device: DeviceService,
    private accountService: AccountService,
    private shareLinkApiService: ShareLinksApiService,
  ) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    try {
      const token = route.queryParams.token;
      const accountId = route.queryParams.accountId;
      const archiveId = route.queryParams.archiveId;
      const archiveNbr = route.queryParams.archiveNbr;
      const itemId = route.queryParams.itemId;
      const itemType = route.queryParams.itemType;
      let folder = null;
      let record = null;

      const headers = { 'X-Permanent-Share-Token': token };

      const responseArray = await this.shareLinkApiService.getShareLinksByToken(
        [token],
      );

      const response = responseArray[0];

      if (itemType === 'folder') {
        const response = await this.api.folder.getWithChildren(
          [new FolderVO({ folderId: itemId, archiveId })],
          true,
          headers,
        );
        folder = response[0];
      } else if (itemType === 'record') {
        const response = await this.api.record.get(
          [new RecordVO({ recordId: itemId })],
          true,
          headers,
        );
        record = response[0];
      }

      const account = (
        await this.api.account.get(new AccountVO({ accountId }))
      ).getAccountVO();
      const archive = await this.api.archive.get([
        new ArchiveVO({ archiveId: +archiveId, archiveNbr }),
      ]);

      (response as any).AccountVO = account;
      (response as any).FolderVO = folder;
      (response as any).RecordVO = record;
      (response as any).ArchiveVO = archive;

      return response;
    } catch (error) {
      console.log(error);
      if (error.getMessage) {
        if (error.messageIncludes('warning.auth.mfaToken')) {
          this.accountService.setRedirect(['/share', route.params.shareToken]);
          return this.router.navigate(['/app', 'auth', 'mfa']);
        } else {
          this.message.showError({
            message: error.getMessage(),
            translate: true,
          });
        }
      }
      return this.router.navigate(['share', 'error']);
    }
  }
}
