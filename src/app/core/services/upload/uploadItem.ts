import { FolderVO, RecordVO, RecordVOData } from '@root/app/models';

export enum UploadStatus {
  Init,
  Meta,
  Transfer,
  Done,
  Cancelled
}

export class UploadItem {
  public uploadStatus: UploadStatus = UploadStatus.Init;
  public streamId: string;
  public RecordVO: RecordVO;

  constructor(public file: File, public parentFolder: FolderVO) {
    this.RecordVO = new RecordVO({
      parentFolderId: parentFolder.folderId,
      parentFolder_linkId: parentFolder.folder_linkId,
      displayName: file.name,
      uploadFileName: file.name,
      derivedCreatedDT: file.lastModifiedDate,
    });
  }
}
