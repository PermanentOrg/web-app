import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
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

	async canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<any> {
		return await this.account
			.checkSession()
			.then((isSessionValid: boolean) => {
				if (isSessionValid && this.account.isLoggedIn()) {
					return true;
				} else {
					if (isSessionValid !== this.account.isLoggedIn()) {
						this.account.clear();
					}
					this.router.navigate(['/app', 'auth', 'login'], {
						queryParams: next.queryParams,
					});
					return false;
				}
			})
			.catch(() => {
				this.account.clear();
				this.router.navigate(['/app', 'auth', 'login'], {
					queryParams: next.queryParams,
				});
				return false;
			});
	}

	canActivateChild(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<boolean> | Promise<boolean> | boolean {
		if (this.account.isLoggedIn()) {
			return true;
		} else {
			this.router.navigate(['/app', 'onboarding'], {
				queryParams: next.queryParams,
			});
			return false;
		}
	}
}
