import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { DeviceService } from '@shared/services/device/device.service';
import { AccountService } from '@shared/services/account/account.service';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';

import { ShareResponse } from '@shared/services/api/index.repo';

@Injectable()
export class ShareUrlResolveService {
	constructor(
		private api: ApiService,
		private message: MessageService,
		private router: Router,
		private device: DeviceService,
		private accountService: AccountService,
		private shareLinksService: ShareLinksService,
	) {}

	async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const shareToken = route.params.shareToken;
		const [shareResponse] = await Promise.all([
			this.api.share
				.checkShareLink(shareToken)
				.catch((response: ShareResponse) => response),
			this.shareLinksService.primeForToken(shareToken),
		]);

		if (shareResponse.isSuccessful) {
			return shareResponse.getShareByUrlVO();
		}

		if (shareResponse.getMessage) {
			if (shareResponse.messageIncludes('warning.auth.mfaToken')) {
				this.accountService.setRedirect(['/share', shareToken]);
				return await this.router.navigate(['/app', 'auth', 'mfa']);
			}
			this.message.showError({
				message: shareResponse.getMessage(),
				translate: true,
			});
		}
		return await this.router.navigate(['share', 'error']);
	}
}
