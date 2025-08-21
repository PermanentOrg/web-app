import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { PublishResponse } from '@shared/services/api/index.repo';
import { RecordVO } from '@models';

@Injectable()
export class PublishResolveService {
	constructor(
		private api: ApiService,
		private message: MessageService,
		private router: Router,
	) {}

	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<any> {
		return await this.api.publish
			.getResource(route.params.publishUrlToken)
			.then((response: PublishResponse): RecordVO | any => {
				const item = response.getRecordVO() || response.getFolderVO();

				if (item) {
					const publicArchiveNbr = `${item.archiveNbr.split('-')[0]}-0000`;
					const destination: any[] = ['/p', 'archive', publicArchiveNbr];

					if (item.isRecord) {
						destination.push('record', item.archiveNbr);
					} else {
						destination.push(item.archiveNbr, item.folder_linkId);
					}

					return this.router.navigate(destination);
				} else {
					throw response;
				}
			})
			.catch(async (response: PublishResponse) => {
				if (response.getMessage) {
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				}
				return await this.router.navigate(['p', 'error']);
			});
	}
}
