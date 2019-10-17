import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { find, cloneDeep } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderResponse } from '@shared/services/api/index.repo';

import { FolderVO } from '@root/app/models';

@Injectable()
export class FolderResolveService implements Resolve<any> {

  constructor(
    private api: ApiService,
    private accountService: AccountService,
    private message: MessageService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    let targetFolder;

    if (route.params.archiveNbr && route.params.folderLinkId) {
      targetFolder = new FolderVO({archiveNbr: route.params.archiveNbr, folder_linkId: route.params.folderLinkId});
    } else if (state.url === '/apps') {
      const apps = find(this.accountService.getRootFolder().ChildItemVOs, {type: 'type.folder.root.app'});
      targetFolder = new FolderVO(apps);
    } else if (state.url.includes('/share/') ) {
      const sharedFolder = route.parent.data.sharePreviewVO.FolderVO;
      if (sharedFolder) {
        targetFolder = new FolderVO(sharedFolder);
      } else {
        const folder = new FolderVO(cloneDeep(route.parent.data.currentFolder));
        folder.pathAsArchiveNbr.unshift('0000-0000', '0000-0000');
        folder.pathAsText.unshift('Shares', 'Record');
        folder.pathAsFolder_linkId.unshift(0, 0);
        return Promise.resolve(folder);
      }
    } else {
      const myFiles = find(this.accountService.getRootFolder().ChildItemVOs, {type: 'type.folder.root.private'});
      targetFolder = new FolderVO(myFiles);
    }

    return this.api.folder.navigate(targetFolder)
      .pipe(map(((response: FolderResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response.getFolderVO(true);
      }))).toPromise().catch((response: FolderResponse) => {
        this.message.showError(response.getMessage(), true);
        if (targetFolder.type.includes('root')) {
          this.accountService.logOut()
          .then(() => {
            this.router.navigate(['/login']);
          })
          .catch(() => {
            this.router.navigate(['/login']);
          });
        } else if (state.url.includes('apps')) {
          this.router.navigate(['/apps']);
        } else {
          this.router.navigate(['/myfiles']);
        }
        return Promise.reject(false);
      });
  }
}
