import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { find } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveVO } from '@models';

@Injectable()
export class RootFolderResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private accountService: AccountService,
    private messageService: MessageService
  ) { }

  async resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    // check for targetArchiveNbr parameter and switch archives if possible
    const targetArchiveNbr = route.queryParams.targetArchiveNbr;

    if (targetArchiveNbr && this.accountService.getArchive().archiveNbr !== targetArchiveNbr) {
      const archives = await this.accountService.refreshArchives();
      const targetArchive = find(archives, {archiveNbr: targetArchiveNbr}) as ArchiveVO;
      if (targetArchive) {
        await this.accountService.changeArchive(targetArchive);
      } else {
        this.messageService.showMessage(
          `The current account does not have access to the specified archive. Switch accounts to perform this action.`,
          'info'
        );
      }
    }

    const currentRoot = this.accountService.getRootFolder();

    return this.api.folder.getRoot()
      .then((response: FolderResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }
        const root = response.getFolderVO();
        this.accountService.setRootFolder(root);
        return root;
      });
  }
}
