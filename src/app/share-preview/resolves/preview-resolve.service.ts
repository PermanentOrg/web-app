import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { RecordVO, ShareByUrlVO, FolderVO, RecordVOData } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
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
  constructor(
    private api: ApiService,
    private message: MessageService,
    private router: Router,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<any> {
    const token = route.queryParams.token;
    const itemType = route.queryParams.itemType;
    const itemId = route.queryParams.itemId;
    const archiveId = route.queryParams.archiveId;

    console.log(route.parent.data);

    const sharedData = route.parent.data.sharePreviewItem;

    if (token && itemType && itemId) {
      // New flow via v2 API using token
      const headers = { 'X-Permanent-Share-Token': token };

      if (itemType === 'record') {
        return this.api.record
          .get([new RecordVO({ recordId: itemId })], true, headers)
          .then((records) => {
            console.log(records);
            const record = (
              Array.isArray(records) ? records[0] : records
            ) as RecordVO;
            record.dataStatus = DataStatus.Full;

            const folder = new FolderVO({
              displayName: record.displayName,
              description: record.description,
              archiveId: record.archiveId,
              type: 'type.folder.share',
              ChildItemVOs: [record],
              pathAsText: [record.displayName],
              pathAsArchiveNbr: ['0000-0000'],
              pathAsFolder_linkId: [0],
            });

            return folder;
          })
          .catch((error) => {
            this.message.showError({
              message: 'share.error.invalidLink',
              translate: true,
            });
            return this.router.navigate(['share', 'error']);
          });
      }

      if (itemType === 'folder') {
        return this.api.folder
          .getWithChildren(
            [new FolderVO({ folderId: itemId, archiveId })],
            true,
            headers,
          )
          .then((folders) => {
            const folder = Array.isArray(folders) ? folders[0] : folders;
            setDummyPathFromDisplayName(folder);
            return folder;
          })
          .catch((error) => {
            this.message.showError({
              message: 'share.error.invalidLink',
              translate: true,
            });
            return this.router.navigate(['share', 'error']);
          });
      }

      this.message.showError({ message: 'Invalid item type.' });
      return this.router.navigate(['share', 'error']);
    }

    // === OLD LOGIC ===
    const sharePreviewVO = route.parent.data.sharePreviewVO as ShareByUrlVO;

    console.log(sharePreviewVO)

    const showPreview =
      sharePreviewVO.previewToggle ||
      (sharePreviewVO.ShareVO && sharePreviewVO.ShareVO.previewToggle) ||
      !!route.params.inviteCode ||
      !!route.params.shareId;

    if (sharePreviewVO.FolderVO && showPreview) {
      setDummyPathFromDisplayName(sharePreviewVO.FolderVO);
      return Promise.resolve(new FolderVO(sharePreviewVO.FolderVO, true));
    } else if (sharePreviewVO.FolderVO) {
      const dummyFolder = new FolderVO({
        displayName: sharePreviewVO.FolderVO.displayName,
        description: sharePreviewVO.FolderVO.description,
        archiveId: sharePreviewVO.FolderVO.archiveId,
        type: 'type.folder.share',
        ChildItemVOs: dummyItems,
      });

      setDummyPathFromDisplayName(dummyFolder);
      return Promise.resolve(dummyFolder);
    } else {
      let record = sharePreviewVO.RecordVO as RecordVO;
      record.dataStatus = DataStatus.Full;

      if (!sharePreviewVO.previewToggle && !showPreview) {
        const dummy = dummyItems[0];
        record = cloneDeep(record);
        record.thumbURL200 = dummy.thumbURL200;
        record.thumbURL500 = dummy.thumbURL500;
        record.thumbURL1000 = dummy.thumbURL1000;
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

      return Promise.resolve(dummyRecordFolder);
    }
  }
}

function setDummyPathFromDisplayName(folder: FolderVO) {
  folder.pathAsText = [folder.displayName];
  folder.pathAsArchiveNbr = ['0000-0000'];
  folder.pathAsFolder_linkId = [0];
  return folder;
}
