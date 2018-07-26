import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';

import { FolderVO } from '@root/app/models';

import { FolderResponse } from '@shared/services/api/index.repo';

@Injectable()
export class AppsFolderResolveService implements Resolve<any> {

  constructor(private api: ApiService, private accountService: AccountService, private dataService: DataService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    return this.loadAppsFolder()
      .then((appsFolder: FolderVO) => {
        return this.loadConnectorFolders(appsFolder);
      });
  }

  loadAppsFolder() {
    const apps = _.find(this.accountService.getRootFolder().ChildItemVOs, {type: 'type.folder.root.app'});

    return this.api.folder.navigate(new FolderVO(apps))
      .pipe(map(((response: FolderResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response.getFolderVO(true);
      }))).toPromise().catch((error) => {
        console.error(error);
      });
  }

  loadConnectorFolders(appsFolder: FolderVO) {
    appsFolder.ChildItemVOs.forEach((item) => {
      this.dataService.registerItem(item);
    });

    return this.dataService.fetchLeanItems(appsFolder.ChildItemVOs, appsFolder)
    .then(() => {
      appsFolder.ChildItemVOs.forEach((item) => {
        this.dataService.deregisterItem(item);
      });
      return Promise.resolve(appsFolder);
    });

  }


}
