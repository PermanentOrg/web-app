import { Injectable } from '@angular/core';
import { FolderVO } from '@models/index';
import { FolderIdentifier } from './types/filesystem-identifier';
import { PermanentFilesystem } from './permanent-filesystem';
import { FilesystemApiService } from './filesystem-api.service';

@Injectable({
	providedIn: 'root',
})
export class FilesystemService {
	public permanentFilesystem: PermanentFilesystem;

	constructor(private api: FilesystemApiService) {
		this.permanentFilesystem = new PermanentFilesystem(this.api);
	}

	public async getFolder(identifier: FolderIdentifier): Promise<FolderVO> {
		return this.permanentFilesystem.getFolder(identifier);
	}
}
