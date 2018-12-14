import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/index';

@Injectable()
export class MembersResolveService implements Resolve<any> {

  constructor(private api: ApiService, private accountService: AccountService) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    return this.api.archive.getMembers(this.accountService.getArchive())
      .then((response: ArchiveResponse) => {
        const currentAccount = this.accountService.getAccount();
        const members = response.getAccountVOs();
        members.forEach((member: AccountVO) => {
          if (member.accountId === currentAccount.accountId) {
            member.isCurrent = true;
          }
        });
        return members;
      });
  }
}
