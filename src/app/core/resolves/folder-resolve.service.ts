/* @format */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { find, cloneDeep } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderResponse } from '@shared/services/api/index.repo';

import { FolderVO } from '@root/app/models';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { findRouteData } from '@shared/utilities/router';
import { FilesystemService } from '@root/app/filesystem/filesystem.service';

@Injectable()
export class FolderResolveService {
  constructor(
    private accountService: AccountService,
    private message: MessageService,
    private router: Router,
    private filesystem: FilesystemService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> {
    let targetFolder: FolderVO;

    if (route.params.archiveNbr && route.params.folderLinkId) {
      targetFolder = new FolderVO({
        archiveNbr: route.params.archiveNbr,
        folder_linkId: route.params.folderLinkId,
      });
    } else if (state.url === '/apps') {
      const apps = find(this.accountService.getRootFolder().ChildItemVOs, {
        type: 'type.folder.root.app',
      });
      targetFolder = new FolderVO(apps);
    } else if (state.url.includes('/share')) {
      const sharedFolder =
        route.parent.data.sharePreviewItem?.FolderVO ||
        route.parent.data.sharePreviewVO?.FolderVO;
      const sharedRecord =
        route.parent.data.sharePreviewItem?.RecordVO ||
        route.parent.data.sharePreviewVO?.RecordVO;
      if (sharedFolder) {
        sharedFolder.folder_linkId = sharedFolder.folderLinkId;
        sharedFolder.archiveNbr = sharedFolder.archiveNumber;
        targetFolder = new FolderVO(sharedFolder);
      } else {
        const folder = new FolderVO(cloneDeep(route.parent.data.currentFolder));
        folder.pathAsArchiveNbr.unshift('0000-0000', '0000-0000');
        folder.pathAsText.unshift('Shares', 'Record');
        folder.pathAsFolder_linkId.unshift(0, 0);
        folder.ChildItemVOs = [sharedRecord];
        return Promise.resolve(folder);
      }
    } else if (state.url.includes('/p/archive/')) {
      const publicRoot = findRouteData(route, 'publicRoot');
      targetFolder = new FolderVO(publicRoot);
    } else if (state.url.includes('/public')) {
      const publicRoot = find(
        this.accountService.getRootFolder().ChildItemVOs,
        { type: 'type.folder.root.public' },
      );
      targetFolder = new FolderVO(publicRoot);
    } else {
      const myFiles = find(this.accountService.getRootFolder().ChildItemVOs, {
        type: 'type.folder.root.private',
      });
      targetFolder = new FolderVO(myFiles);
    }

    return this.filesystem
      .getFolder(targetFolder)
      .then((folder: FolderVO): any => {
        if (
          !folder.type.includes('root') &&
          folder.view === FolderView.Timeline &&
          !route.data.folderView
        ) {
          if (route.params.publicArchiveNbr) {
            return this.router.navigate([
              'p',
              'archive',
              route.params.publicArchiveNbr,
              'view',
              'timeline',
              route.params.archiveNbr,
              route.params.folderLinkId,
            ]);
          }
        }
        return folder;
      })
      .catch((response: FolderResponse) => {
        this.message.showError({
          message: response.getMessage(),
          translate: true,
        });
        if (targetFolder.type.includes('root')) {
          this.accountService
            .logOut()
            .then(() => {
              this.router.navigate(['/login']);
            })
            .catch(() => {
              this.router.navigate(['/login']);
            });
        } else if (state.url.includes('apps')) {
          this.router.navigate(['/apps']);
        } else {
          this.router.navigate(['/private']);
        }
        return Promise.reject(false);
      });
  }
}
