import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { FolderVO, RecordVO, RecordVOData } from '@models/index';
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
export class PreviewFolderResolveService implements Resolve<any> {
  constructor(
  ) { }

  resolve( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
    const previewItem = route.parent.data.previewItem as FolderVO;

    // generate a dummy 'preview folder' using random blurred images
    const dummyFolder = new FolderVO({
      displayName: previewItem.displayName,
      archiveId: previewItem,
      type: 'type.folder.share',
      ChildItemVOs: dummyItems,
      pathAsText: [ previewItem.displayName ],
      pathAsArchiveNbr: ['0000-0000'],
      pathAsFolder_linkId: [0]
    });

    return dummyFolder;
  }
}
