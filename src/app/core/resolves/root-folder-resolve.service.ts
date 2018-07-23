import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';

@Injectable()
export class RootFolderResolveService implements Resolve<any> {

  constructor(private api: ApiService, private accountService: AccountService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    const currentRoot = this.accountService.getRootFolder();

    if (currentRoot && currentRoot.archiveId === this.accountService.getArchive().archiveId) {
      console.log('root-folder-resolve.service.ts', 20, 'dont need to load it again!');
      return Promise.resolve(currentRoot);
    }

    console.log('root-folder-resolve.service.ts', 24, 'gonna load it');

    return this.api.folder.getRoot()
      .pipe(map(((response: FolderResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        const root = response.getFolderVO();

        this.accountService.setRootFolder(root);

        return root;
      }))).toPromise();
  }
}
