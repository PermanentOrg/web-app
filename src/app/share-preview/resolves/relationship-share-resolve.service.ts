import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';

import { find } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { ShareResponse } from '@shared/services/api/index.repo';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO } from '@models';

@Injectable()
export class RelationshipShareResolveService {
	constructor(
		private api: ApiService,
		private account: AccountService,
		private message: MessageService,
		private router: Router,
	) {}

	async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if (route.queryParams.targetArchiveNbr && this.account.isLoggedIn()) {
			const archives = await this.account.refreshArchives();
			const targetArchive = find(archives, {
				archiveNbr: route.queryParams.targetArchiveNbr,
			}) as ArchiveVO;
			if (targetArchive) {
				await this.account.changeArchive(targetArchive);
			}
		}

		return await this.api.share
			.getShareForPreview(route.params.shareId, route.params.folder_linkId)
			.then((response: ShareResponse): any => {
				if (response.isSuccessful) {
					return response.getShareVO();
				} else {
					throw response;
				}
			})
			.catch((response: ShareResponse) => {
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
