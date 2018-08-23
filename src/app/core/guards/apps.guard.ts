import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '@shared/services/account/account.service';

@Injectable({
  providedIn: 'root'
})
export class AppsGuard implements CanActivate {
  constructor (private account: AccountService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const queryParams = next.queryParams;

    if (queryParams && queryParams.redirect === 'facebook') {
      this.router.navigate(['/apps']);
      return false;
    } else {
      return true;
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const queryParams = next.queryParams;

    if (queryParams && queryParams.redirect === 'facebook') {
      this.router.navigate(['/apps']);
      return false;
    } else {
      return true;
    }
  }
}
