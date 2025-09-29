import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { FolderVO, RecordVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { DataStatus } from '@models/data-status.enum';
import { FilesystemApi } from './types/filesystem-api';
import {
	FolderIdentifier,
	RecordIdentifier,
} from './types/filesystem-identifier';
import { ArchiveIdentifier } from './types/archive-identifier';
import { ShareLinksService } from '../share-links/services/share-links.service';
import { FolderResponse } from '@shared/services/api/folder.repo';

@Injectable({
	providedIn: 'root',
})
export class FilesystemApiService implements FilesystemApi {
	constructor(private api: ApiService,
		private shareLinksService: ShareLinksService,
	) {}

	public async navigate(folder: FolderIdentifier): Promise<FolderVO> {
		const isUnlistedShare = await this.shareLinksService.isUnlistedShare();
		let response: FolderResponse = null;
		if(isUnlistedShare) {
			response = await this.api.folder.getWithChildren([new FolderVO(folder)], this.shareLinksService.currentShareToken);
		} else {
		response = await firstValueFrom(
			this.api.folder.navigateLean(new FolderVO(folder)),
		);
		}
		if (!response.isSuccessful) {
			throw response;
		}
		return response.getFolderVO(true, DataStatus.Lean);
	}

	public getRecord: (record: RecordIdentifier) => Promise<RecordVO>;
	public getRoot: (archive: ArchiveIdentifier) => Promise<FolderVO>;
}
