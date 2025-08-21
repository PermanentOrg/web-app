import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { ArchiveResponse } from '@shared/services/api/index.repo';
import { ArchiveVO } from '@models';

@Injectable()
export class PublishArchiveResolveService {
	constructor(
		private api: ApiService,
		private message: MessageService,
		private router: Router,
	) {}

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const archiveId = route.parent.data.publishedItem.archiveId;
		const archiveNbr = route.parent.data.publishedItem.archiveArchiveNbr;
		return this.api.archive
			.get([new ArchiveVO({ archiveId, archiveNbr })])
			.then((response: ArchiveResponse): ArchiveVO => response.getArchiveVO());
		// return this.api.publish.getResource(route.params.publishUrlToken)
		//   .then((response: PublishResponse): RecordVO | any => {
		//     if (response.getRecordVO()) {
		//       return response.getRecordVO();
		//     } else {
		//       return response.getFolderVO();
		//     }
		//   });
	}
}
