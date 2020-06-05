import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';

@Injectable()
export class ProfileItemsResolveService implements Resolve<any> {

  constructor(private api: ApiService, private accountService: AccountService) { }

  async resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    const response = await this.api.archive.getAllProfileItems(this.accountService.getArchive());
    console.log(response.getResultsData());
    return response.getProfileItemVOs();
  }
}
