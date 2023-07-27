import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { ProfileService } from '@shared/services/profile/profile.service';

@Injectable()
export class ProfileItemsResolveService implements Resolve<any> {
  constructor(
    private profile: ProfileService,
    private account: AccountService
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    return this.profile.fetchProfileItems();
  }
}
