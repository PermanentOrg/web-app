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
    private message: MessageService,
    private router: Router,
    private api: ApiService,
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<any> {
    const token = route.queryParams.token;
    const itemType = route.queryParams.itemType;
    const itemId = route.queryParams.itemId;
    const archiveId = route.queryParams.archiveId;

    if (!token || !itemType || !itemId) {
      this.message.showError({ message: 'Missing token or item data.' });
      return this.router.navigate(['share', 'error']);
    }

    try {
      let item;

      if (itemType === 'record') {
        const response = await this.api.record.get(
          [new RecordVO({ recordId: itemId })],
          true,
          { 'X-Permanent-Share-Token': token },
        );
        console.log(response);
      } else if (itemType === 'folder') {
        const response = await this.api.folder.getWithChildren(
          [new FolderVO({ folderId: itemId, archiveId })],
          true,
          { 'X-Permanent-Share-Token': token },
        );

        console.log(response);
      }
    } catch (err) {
      console.error('Failed to resolve shared item:', err);
      this.message.showError({
        message: 'share.error.invalidLink',
        translate: true,
      });
      return this.router.navigate(['share', 'error']);
    }
  }
}

function setDummyPathFromDisplayName(folder: FolderVO) {
  folder.pathAsText = [folder.displayName];
  folder.pathAsArchiveNbr = ['0000-0000'];
  folder.pathAsFolder_linkId = [0];
  return folder;
}
