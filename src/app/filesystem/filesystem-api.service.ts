/* @format */
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

@Injectable({
	providedIn: 'root',
})
export class FilesystemApiService implements FilesystemApi {
	constructor(private api: ApiService) {}

	public async navigate(folder: FolderIdentifier): Promise<FolderVO> {
		const response = await firstValueFrom(
			this.api.folder.navigateLean(new FolderVO(folder)),
		);
		if (!response.isSuccessful) {
			throw response;
		}
		return response.getFolderVO(true, DataStatus.Lean);
	}

	public getRecord: (record: RecordIdentifier) => Promise<RecordVO>;
	public getRoot: (archive: ArchiveIdentifier) => Promise<FolderVO>;
}
