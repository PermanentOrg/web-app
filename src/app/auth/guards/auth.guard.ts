import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

import { AccountService } from '@shared/services/account/account.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private account: AccountService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.account.getAccount()?.accountId) {
      return this.account.hasOwnArchives().then((hasArchives) => {
        if (hasArchives) {
          return this.router.parseUrl('/app/private');
        }
        return this.router.parseUrl('/app/onboarding');
      });
    }
    return true;
  }
}
