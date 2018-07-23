import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { FolderVO } from '@root/app/models';

@Injectable()
export class FolderResolveService implements Resolve<any> {

  constructor(private api: ApiService, private accountService: AccountService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    const myFiles =  _.find(this.accountService.getRootFolder().ChildItemVOs, {type: 'type.folder.root.private'});

    return this.api.folder.get([new FolderVO(myFiles)])
      .pipe(map(((response: FolderResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response.getFolderVO();
      }))).toPromise();
  }
}
