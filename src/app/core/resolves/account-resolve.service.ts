import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';

@Injectable()
export class AccountResolveService {
	constructor(private accountService: AccountService) {}

	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<any> {
		return await this.accountService.refreshAccount();
	}
}
