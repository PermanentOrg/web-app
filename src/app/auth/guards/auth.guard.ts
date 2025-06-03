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
		const queryParams = route.queryParamMap;

		const inviteCode = queryParams.get('inviteCode');
		const fullName = queryParams.get('fullName');
		const primaryEmail = queryParams.get('primaryEmail');
		const isInviteSignup = inviteCode && fullName && primaryEmail;

		if (this.account.getAccount()?.accountId) {
			if (state.url.includes('/signup') && isInviteSignup) {
				return this.router.createUrlTree([
					'/app',
					{ outlets: { primary: 'private', dialog: 'archives/pending' } },
				]);
			}
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
