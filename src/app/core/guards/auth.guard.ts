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
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.account.checkSession()
    .then((isSessionValid: boolean) => {
      if (isSessionValid && this.account.isLoggedIn()) {
        return true;
      } else if (this.account.getAccount() && this.account.getAccount().needsVerification()) {
        this.router.navigate(['/verify']);
        return false;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    });
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.account.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
