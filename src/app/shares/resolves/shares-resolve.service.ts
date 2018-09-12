import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import * as _ from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderVO } from '@root/app/models';

import { FolderResponse, ShareResponse } from '@shared/services/api/index.repo';

@Injectable()
export class SharesResolveService implements Resolve<any> {
  constructor(
    private api: ApiService,
    private accountService: AccountService,
    private dataService: DataService,
    private message: MessageService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<any>|Promise<any> {
    return this.api.share.getShares()
      .then((response: ShareResponse) => {
        return response.getArchiveVOs();
      });
  }
}
