/* @format */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Redirects any nested routes from /app/myfiles/** to /app/private/**
 */
@Injectable({
  providedIn: 'root',
})
export class MyfilesGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.router.parseUrl(state.url.replace(/^\/app\/myfiles/, '/app/private'));
  }
}