import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';

import { RecordResponse } from '@shared/services/api/index.repo';
import { RecordVO, ShareByUrlVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';

@Injectable()
export class RecordResolveService {
	constructor(
		private api: ApiService,
		private dataService: DataService,
		private message: MessageService,
		private shareLinksService: ShareLinksService,
	) {}

	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<RecordVO> {
		const unlistedSharedRecord = await this.findUnlistedSharedRecord(route);
		if (unlistedSharedRecord) {
			return unlistedSharedRecord;
		}

		const localItem = this.dataService.getItemByArchiveNbr(
			route.params.recArchiveNbr,
		);

		try {
			if (localItem && localItem.dataStatus === DataStatus.Full) {
				return await Promise.resolve(localItem as RecordVO);
			} else if (localItem) {
				await this.dataService.fetchFullItems([localItem]);
				return localItem as RecordVO;
			} else {
				const response = await this.api.record.get([
					new RecordVO({ archiveNbr: route.params.recArchiveNbr }),
				]);
				const record = response.getRecordVO();
				record.dataStatus = DataStatus.Full;
				return record;
			}
		} catch (err) {
			if (err instanceof RecordResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
			throw err;
		}
	}

	// A record share's address holds a placeholder archive number, not the real one.
	private async findUnlistedSharedRecord(
		route: ActivatedRouteSnapshot,
	): Promise<RecordVO | undefined> {
		const sharedRecord = (route.data.sharePreviewVO as ShareByUrlVO | undefined)
			?.RecordVO as RecordVO | undefined;
		if (!sharedRecord) {
			return undefined;
		}
		const isUnlistedShare = await this.shareLinksService.isUnlistedShareToken(
			route.params.shareToken,
		);
		return isUnlistedShare ? sharedRecord : undefined;
	}
}
