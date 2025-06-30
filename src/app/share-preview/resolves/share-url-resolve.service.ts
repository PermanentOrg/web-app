import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { cloneDeep } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';

import { FolderVO, RecordVO } from '@models';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';

@Injectable()
export class ShareUrlResolveService {
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router,
    private accountService: AccountService,
    private shareLinkApi: ShareLinksApiService,
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<any> {
    try {
      const itemType = route.params['itemType'];
      const token = route.params['token'];
      const itemId = route.params['itemId'];
      const headers = { 'X-Permanent-Share-Token': token };
      let response = {};

      let folder: any = null;
      let record: any = null;

      if (itemType === 'folder') {
        const folderArray = await this.api.folder.get(
          [new FolderVO({ folderId: itemId })],
          true,
          headers,
        );

        const children: any = await this.api.folder.getWithChildren(
          [new FolderVO({ folderId: itemId })],
          true,
          headers,
        );

        const folderItems = folderArray[0]?.items?.[0];

        folder = {
          ...folderItems,
          ChildItemVOs: children.items,
          pathAsFolder_linkId: [0, 0],
          pathAsArchiveNbr: ['0000-0000', '0000-0000'],
        };

        if (folderItems.paths && folderItems.paths.names) {
          folder.pathAsText = ['Shares', ...folderItems.paths.names];
        }

        response = {
          FolderVO: folder,
          ArchiveVO: folder.archive,
          AccountVO: folder.shareLink?.creatorAccount,
        };
      } else if (itemType === 'record') {
        const recordResponse = await this.api.record.get(
          [new RecordVO({ recordId: itemId })],
          true,
          headers,
        );
        record = recordResponse?.[0];

        // Wrap record inside a dummy folder structure if needed
        const dummyFolder = new FolderVO({
          archiveNbr: record.archive?.archiveNbr || '0000-0000',
          pathAsArchiveNbr: ['0000-0000', '0000-0000'],
          pathAsText: ['Shares', 'Record', record.displayName],
          pathAsFolder_linkId: [0, 0],
        });
        dummyFolder.ChildItemVOs = [record];
        dummyFolder.description = record.description;

        response = {
          FolderVO: dummyFolder,
          RecordVO: record,
          ArchiveVO: record.archive,
        };
      }

      const shareLinkResponseArray =
        await this.shareLinkApi.getShareLinksByToken([token]);
      const shareLinkResponse = shareLinkResponseArray[0];
      response = {
        ...response,
        shareLinkResponse,
        AccountVO: shareLinkResponse.creatorAccount,
      };
      return response;
    } catch (error: any) {
      if (error.getMessage) {
        if (error.messageIncludes('warning.auth.mfaToken')) {
          this.accountService.setRedirect(['/share', route.params.token]);
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
