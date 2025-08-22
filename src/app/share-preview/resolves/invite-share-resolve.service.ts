import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { InviteResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';

@Injectable()
export class InviteShareResolveService {
	constructor(
		private api: ApiService,
		private account: AccountService,
		private message: MessageService,
		private router: Router,
	) {}

	async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return await this.api.invite
			.getFullShareInvite(route.params.inviteCode)
			.then((response: InviteResponse): any => {
				if (response.isSuccessful) {
					const inviteVO = response.getInviteVO();
					return inviteVO;
				} else {
					throw response;
				}
			})
			.catch((response: InviteResponse) => {
				if (response.getMessage) {
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				}
				return this.router.navigate(['share', 'error']);
			});
	}
}
