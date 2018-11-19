import { BaseVO } from '@models/base-vo';
import { DataStatus } from '@models/data-status.enum';

export class RecordVO extends BaseVO {
  public cleanParams = ['recordId', 'archiveNbr', 'folder_linkId', 'parentFolder_linkId', 'parentFolderId'];
  public isRecord = true;
  public isFolder = false;

  public isFetching = false;
  public fetched: Promise<boolean>;

  public dataStatus = DataStatus.Placeholder;

  public recordId;
  public archiveId;
  public archiveNbr;
  public publicDT;
  public note;
  public displayName;
  public uploadFileName;
  public uploadAccountId;
  public size;
  public description;
  public displayDT;
  public displayEndDT;
  public derivedDT;
  public derivedEndDT;

  public derivedCreatedDT;
  public locnId;
  public timeZoneId;
  public view;
  public viewProperty;
  public imageRatio;
  public encryption;
  public metaToken;
  public refArchiveNbr;
  public type;

  // Thumbnails
  public thumbStatus;
  public thumbURL200;
  public thumbURL500;
  public thumbURL1000;
  public thumbURL2000;
  public thumbDT;

  // Statuses
  public fileStatus;
  public status;

  // ProcessedDT
  public processedDT;

  // Comes from the FolderLinkVO
  public FolderLinkVOs;
  public folder_linkId: number;
  public parentFolderId: number;
  public position;
  public accessRole;
  public folderArchiveId: number;
  public folder_linkType;

  // For the iParentFolderVO
  public pathAsFolder_linkId;
  public pathAsText;
  public parentFolder_linkId;
  public ParentFolderVOs;
  public parentArchiveNbr;
  public pathAsArchiveNbr;

  // Other stuff
  public LocnVO;
  public TimezoneVO;
  public FileVOs;
  public DirectiveVOs;
  public TagVOs;
  public TextDataVOs;
  public ArchiveVOs;
  public saveAs;
  public AttachmentRecordVOs;
  public isAttachment;
  public hasAttachments;
  public uploadUri;
  public fileDurationInSecs;
  public batchNbr;
  public RecordExifVO;
  public ShareVOs;
  public AccessVO;

  constructor(voData: any | RecordVOData, initChildren?: boolean, dataStatus?: DataStatus) {
    super(voData);

    if (initChildren) {
    }

    if (dataStatus) {
      this.dataStatus = dataStatus;
    }
  }
}

export interface RecordVOData {
  recordId?: any;
  archiveId?: any;
  archiveNbr?: any;
  publicDT?: any;
  note?: any;
  displayName?: any;
  uploadFileName?: any;
  uploadAccountId?: any;
  size?: any;
  description?: any;
  displayDT?: any;
  displayEndDT?: any;
  derivedDT?: any;
  derivedEndDT?: any;
  derivedCreatedDT?: any;
  locnId?: any;
  timeZoneId?: any;
  view?: any;
  viewProperty?: any;
  imageRatio?: any;
  encryption?: any;
  metaToken?: any;
  refArchiveNbr?: any;
  type?: any;
  thumbStatus?: any;
  thumbURL200?: any;
  thumbURL500?: any;
  thumbURL1000?: any;
  thumbURL2000?: any;
  thumbDT?: any;
  fileStatus?: any;
  status?: any;
  processedDT?: any;
  FolderLinkVOs?: any;
  folder_linkId?: number;
  parentFolderId?: number;
  position?: any;
  accessRole?: any;
  folderArchiveId?: number;
  folder_linkType?: any;
  pathAsFolder_linkId?: any;
  pathAsText?: any;
  parentFolder_linkId?: any;
  ParentFolderVOs?: any;
  parentArchiveNbr?: any;
  pathAsArchiveNbr?: any;
  LocnVO?: any;
  TimezoneVO?: any;
  FileVOs?: any;
  DirectiveVOs?: any;
  TagVOs?: any;
  TextDataVOs?: any;
  ArchiveVOs?: any;
  saveAs?: any;
  AttachmentRecordVOs?: any;
  isAttachment?: any;
  hasAttachments?: any;
  uploadUri?: any;
  fileDurationInSecs?: any;
  batchNbr?: any;
  RecordExifVO?: any;
  ShareVOs?: any;
  AccessVO?: any;
}
