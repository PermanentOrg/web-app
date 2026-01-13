import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RecordVO, ShareByUrlVO, FolderVO, RecordVOData } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { shuffle, cloneDeep } from 'lodash';

// URLs for dummy images
const blurredPhotos = [
	'preview-1.jpg',
	'preview-2.jpg',
	'preview-3.jpg',
	'preview-4.jpg',
	'preview-5.jpg',
	'preview-6.jpg',
	'preview-7.jpg',
	'preview-8.jpg',
	'preview-9.jpg',
	'preview-10.jpg',
	'preview-1.jpg',
	'preview-2.jpg',
	'preview-3.jpg',
	'preview-4.jpg',
	'preview-5.jpg',
	'preview-6.jpg',
	'preview-7.jpg',
	'preview-8.jpg',
	'preview-9.jpg',
	'preview-10.jpg',
];

const dummyItems = shuffle(
	blurredPhotos.map((filename, index) => {
		const url = `assets/img/preview/${filename}`;

		const data: RecordVOData = {
			displayName: `Shared Item`,
			archiveNbr: '0000-0000',
			folder_linkId: 0,
			recordId: 0,
			thumbURL200: url,
			thumbURL500: url,
			thumbURL1000: url,
			type: 'type.record.image',
		};

		const record = new RecordVO(data);
		record.dataStatus = DataStatus.Full;

		return record;
	}),
);

@Injectable()
export class PreviewResolveService {
	async resolve(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Promise<any> {
		const sharePreviewVO = route.parent.data.sharePreviewVO as ShareByUrlVO;
		const showPreview =
			sharePreviewVO.previewToggle ||
			(sharePreviewVO.ShareVO && sharePreviewVO.ShareVO.previewToggle) ||
			!!route.params.inviteCode ||
			!!route.params.shareId;

		if (sharePreviewVO.FolderVO && showPreview) {
			// if folder and share preview on, just show the folder after setting the dummy path

			setDummyPathFromDisplayName(sharePreviewVO.FolderVO);
			return await Promise.resolve(new FolderVO(sharePreviewVO.FolderVO, true));
		} else if (sharePreviewVO.FolderVO) {
			// if folder and share preview off, create the dummy folder with preview images

			const dummyFolder = new FolderVO({
				displayName: sharePreviewVO.FolderVO.displayName,
				description: sharePreviewVO.FolderVO.description,
				archiveId: sharePreviewVO.FolderVO.archiveId,
				type: 'type.folder.share',
				ChildItemVOs: dummyItems,
			});

			setDummyPathFromDisplayName(dummyFolder);

			return await Promise.resolve(dummyFolder);
		} else {
			// if record and share preview on, make dummy folder with just the record
			let record = sharePreviewVO.RecordVO as RecordVO;

			record.dataStatus = DataStatus.Full;

			if (!sharePreviewVO.previewToggle && !showPreview) {
				const dummy = dummyItems[0];
				record = cloneDeep(record);
				record.thumbURL200 = record.thumbURL200 || dummy.thumbURL200;
				record.thumbURL500 = record.thumbURL500 || dummy.thumbURL500;
				record.thumbURL1000 = record.thumbURL1000 || dummy.thumbURL1000;
				record.archiveNbr = dummy.archiveNbr;
			}

			const dummyRecordFolder = new FolderVO({
				displayName: record.displayName,
				description: record.description,
				archiveId: record.archiveId,
				type: 'type.folder.share',
				ChildItemVOs: [record],
				pathAsText: [record.displayName],
				pathAsArchiveNbr: ['0000-0000'],
				pathAsFolder_linkId: [0],
			});

			return await Promise.resolve(dummyRecordFolder);
		}
	}
}

function setDummyPathFromDisplayName(folder: FolderVO) {
	folder.pathAsText = [folder.displayName];
	folder.pathAsArchiveNbr = ['0000-0000'];
	folder.pathAsFolder_linkId = [0];
	return folder;
}
