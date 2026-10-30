import { Injectable } from '@angular/core';
import { ArchiveVO, FolderVO } from '@models/index';
import {
	findAppsRootFolder,
	findPrivateRootFolder,
	findPublicRootFolder,
	isArchiveRootFolder,
} from '@models/folder-type';
import { ApiService } from '@shared/services/api/api.service';

function hasNavigableIds(folder: FolderVO | undefined): boolean {
	return !!folder?.folderId && !!folder.folder_linkId && !!folder.archiveNbr;
}

function isCompleteArchiveRoot(rootFolder: FolderVO | null): boolean {
	const workspaceRootFolders = [
		findPrivateRootFolder(rootFolder),
		findPublicRootFolder(rootFolder),
		findAppsRootFolder(rootFolder),
	];
	return (
		isArchiveRootFolder(rootFolder) &&
		workspaceRootFolders.every(hasNavigableIds)
	);
}

@Injectable({
	providedIn: 'root',
})
export class RootFolderService {
	constructor(private api: ApiService) {}

	public async loadRootFolder(archive: ArchiveVO): Promise<FolderVO> {
		try {
			return await this.loadRootFolderFromStela(archive);
		} catch {
			return await this.loadRootFolderFromV1();
		}
	}

	private async loadRootFolderFromStela(archive: ArchiveVO): Promise<FolderVO> {
		const rootFolderId = await this.api.archive.getRootFolderId(
			archive.archiveId,
		);
		const response = await this.api.folder.getWithChildren([
			new FolderVO({ folderId: rootFolderId }),
		]);
		const rootFolder = response.getFolderVO(true);
		if (!isCompleteArchiveRoot(rootFolder)) {
			throw new Error('Stela returned an incomplete archive root');
		}
		return rootFolder;
	}

	private async loadRootFolderFromV1(): Promise<FolderVO> {
		const response = await this.api.folder.getRoot();
		return response.getFolderVO(true);
	}
}
