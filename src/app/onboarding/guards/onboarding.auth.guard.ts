import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AccountService } from '@shared/services/account/account.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingAuthGuard implements CanActivate {
  constructor(
    private account: AccountService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.account.getAccount()?.accountId) {
      return this.account.refreshArchives().then((archives) => {
        const ownArchives = archives.filter(
          (archive) => !archive.isPending()
        );
        if (ownArchives.length > 0) {
          this.router.navigate(['/app/myfiles']);
          return false;
        } else {
          return true;
        }
      });
    }
    return false;
  }

}
