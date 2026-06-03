import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FolderVO, RecordVO, ShareByUrlVO } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { FilesystemService } from '@root/app/filesystem/filesystem.service';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';

@Injectable()
export class ShareUrlEphemeralFolderResolveService {
	constructor(
		private filesystemService: FilesystemService,
		private shareLinksService: ShareLinksService,
	) {}

	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<FolderVO | null> {
		if (!this.shareLinksService.isUnlistedShareSync()) {
			return null;
		}

		const sharePreviewVO = route.parent?.data?.sharePreviewVO as ShareByUrlVO;
		if (!sharePreviewVO) {
			return null;
		}

		if (sharePreviewVO.FolderVO) {
			return await this.filesystemService.getFolder(sharePreviewVO.FolderVO);
		}

		if (sharePreviewVO.RecordVO) {
			const record = sharePreviewVO.RecordVO as RecordVO;
			record.dataStatus = DataStatus.Full;
			const recordFolder = new FolderVO({
				displayName: record.displayName,
				description: record.description,
				archiveId: record.archiveId,
				type: 'type.folder.share',
				ChildItemVOs: [record],
				pathAsText: [record.displayName],
				pathAsArchiveNbr: ['0000-0000'],
				pathAsFolder_linkId: [0],
			});
			recordFolder.folderId = record.parentFolderId;
			return recordFolder;
		}

		return null;
	}
}
