import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { RecordVO, ShareByUrlVO, FolderVO, RecordVOData } from '@models/index';
import { DataStatus } from '@models/data-status.enum';

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

const dummyItems = blurredPhotos.map((filename, index) => {
  const url = `assets/img/preview/${filename}`;

  const data: RecordVOData = {
    displayName: `Shared Item`,
    archiveNbr: '0000-0000',
    folder_linkId: 0,
    recordId: 0,
    thumbURL200: url,
    thumbURL500: url,
    thumbURL1000: url,
    type: 'type.record.image'
  };

  const record = new RecordVO(data);
  record.dataStatus = DataStatus.Full;

  return record;
});

@Injectable()
export class PreviewResolveService implements Resolve<any> {
  constructor(
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<any> {
    const sharePreviewVO = route.parent.data.sharePreviewVO as ShareByUrlVO;
    if (sharePreviewVO.FolderVO && sharePreviewVO.previewToggle) {
      // if folder and share preview on, just show the folder after setting the dummy path

      setDummyPathFromDisplayName(sharePreviewVO.FolderVO);
      return Promise.resolve(sharePreviewVO.FolderVO);
    } else if (sharePreviewVO.FolderVO) {
      // if folder and share preview off, create the dummy folder with preview images

      const dummyFolder = new FolderVO({
        displayName: sharePreviewVO.FolderVO.displayName,
        archiveId: sharePreviewVO.FolderVO.archiveId,
        type: 'type.folder.share',
        ChildItemVOs: dummyItems,
      });

      setDummyPathFromDisplayName(dummyFolder);

      return Promise.resolve(dummyFolder);
    } else {
      // if record, make dummy folder with just the record

      const record = sharePreviewVO.RecordVO as RecordVO;
      record.dataStatus = DataStatus.Full;

      const dummyRecordFolder = new FolderVO({
        displayName: record.displayName,
        archiveId: record.archiveId,
        type: 'type.folder.share',
        ChildItemVOs: [ record ],
        pathAsText: [ record.displayName ],
        pathAsArchiveNbr: ['0000-0000'],
        pathAsFolder_linkId: [0]
      });

      return Promise.resolve(dummyRecordFolder);
    }
  }
}

function setDummyPathFromDisplayName(folder: FolderVO) {
  folder.pathAsText = [ folder.displayName ];
  folder.pathAsArchiveNbr = ['0000-0000'];
  folder.pathAsFolder_linkId = [0];
  return folder;
}
