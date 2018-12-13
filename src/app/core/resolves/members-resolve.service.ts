import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';

@Injectable()
export class MembersResolveService implements Resolve<any> {

  constructor(private api: ApiService, private accountService: AccountService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    return this.api.archive.getMembers(this.accountService.getArchive())
      .then((response: ArchiveResponse) => {
        return response.getAccountVOs();
      });
  }
}
