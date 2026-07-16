import { Injectable } from '@angular/core';

import { FolderVO, RecordVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { DataStatus } from '@models/data-status.enum';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { ShareLinksService } from '../share-links/services/share-links.service';
import { FilesystemApi } from './types/filesystem-api';
import {
	FolderIdentifier,
	RecordIdentifier,
} from './types/filesystem-identifier';
import { ArchiveIdentifier } from './types/archive-identifier';

@Injectable({
	providedIn: 'root',
})
export class FilesystemApiService implements FilesystemApi {
	constructor(
		private api: ApiService,
		private shareLinksService: ShareLinksService,
	) {}

	public async navigate(folder: FolderIdentifier): Promise<FolderVO> {
		const isUnlistedShare = await this.shareLinksService.isUnlistedShare();
		const shareToken = isUnlistedShare
			? this.shareLinksService.currentShareToken
			: null;
		const response: FolderResponse = await this.api.folder.getWithChildren(
			[new FolderVO(folder)],
			shareToken,
		);
		if (!response.isSuccessful) {
			throw response;
		}
		return response.getFolderVO(true, DataStatus.Lean);
	}

	public getRecord: (record: RecordIdentifier) => Promise<RecordVO>;
	public getRoot: (archive: ArchiveIdentifier) => Promise<FolderVO>;
}
