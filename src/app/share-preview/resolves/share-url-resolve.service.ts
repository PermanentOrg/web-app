import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';

import { RecordVO, FolderVO } from '@models';

@Injectable()
export class ShareUrlResolveService {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router,
    private accountService: AccountService,
  ) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    try {
      const token = route.queryParams.token;
      const itemId = route.queryParams.itemId;
      const itemType = route.queryParams.itemType;
      let folder = null;
      let record = null;

      const headers = { 'X-Permanent-Share-Token': token };

      const response = {};

      if (itemType === 'folder') {
        const folderArray: any = await this.api.folder.get(
          [
            new FolderVO({
              folderId: itemId,
            }),
          ],
          true,
          headers,
        );

        const children: any = await this.api.folder.getWithChildren(
          [new FolderVO({ folderId: itemId })],
          true,
          headers,
        );

        const folderResponse = folderArray[0];
        const folderItems = folderResponse.items[0];

        folder = {
          ...folderItems,
        };

        folder.ChildItemVOs = children.items;
      } else if (itemType === 'record') {
        const response = await this.api.record.get(
          [new RecordVO({ recordId: itemId })],
          true,
          headers,
        );
        record = response[0];
      }

      (response as any).FolderVO = folder;
      (response as any).RecordVO = record;
      (response as any).ArchiveVO = record ? record.archive : folder.archive;
      (response as any).AccountVO = record
        ? record.shareLink?.creatorAccount
        : folder.shareLink?.creatorAccount;

      return response;
    } catch (error) {
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
