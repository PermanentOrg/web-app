import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { find } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';

import { FolderVO } from '@root/app/models';

@Injectable()
export class AppsFolderResolveService implements Resolve<any> {

  constructor(
    private api: ApiService,
    private accountService: AccountService
  ) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    const appsFolder = find(this.accountService.getRootFolder().ChildItemVOs, {type: 'type.folder.root.app'});
    const folderResponse = await this.api.folder.getWithChildren([new FolderVO(appsFolder)])

    return folderResponse.getFolderVO(true);
  }
}
