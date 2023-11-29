import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { ShareResponse } from '@shared/services/api/index.repo';

@Injectable()
export class SharesResolveService  {
  constructor(
    private api: ApiService,
    private accountService: AccountService,
    private dataService: DataService,
    private message: MessageService,
    private router: Router
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    return this.api.share.getShares()
      .then((response: ShareResponse) => {
        return response.getShareArchiveVOs();
      });
  }
}
