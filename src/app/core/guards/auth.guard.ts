import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '@shared/services/account/account.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor (private account: AccountService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return this.account.checkSession()
    .then((isSessionValid: boolean) => {
      if (isSessionValid && this.account.isLoggedIn()) {
        return true;
      } else {
        this.router.navigate(['/app', 'auth', 'login'], { queryParams: next.queryParams });
        return false;
      }
    })
    .catch(() => {
      this.account.clear();
      this.router.navigate(['/app', 'auth', 'login'], { queryParams: next.queryParams });
      return false;
    });
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.account.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/app', 'auth', 'login'], { queryParams: next.queryParams });
      return false;
    }
  }
}
