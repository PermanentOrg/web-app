import { EventEmitter } from '@angular/core';

import { FolderVO, RecordVO, RecordVOData } from '@root/app/models';

export enum UploadStatus {
  Init,
  Meta,
  Transfer,
  Done,
  Cancelled
}

export class UploadItem {
  public RecordVO: RecordVO;
  public uploadStatus: UploadStatus = UploadStatus.Init;
  public transferProgress = 0;
  public updated: EventEmitter<null> = new EventEmitter();

  constructor(public file: File, public parentFolder: FolderVO) {
    this.RecordVO = new RecordVO({
      parentFolderId: parentFolder.folderId,
      parentFolder_linkId: parentFolder.folder_linkId,
      displayName: file.name,
      uploadFileName: file.name,
      derivedCreatedDT: new Date(file.lastModified)
    });
  }

  updateProgress(increment: number) {
    this.transferProgress += increment;
    this.updated.emit();
  }
}
