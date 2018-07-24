import { BaseVO } from '@models/base-vo';
import { DataStatus } from '@models/data-status.enum';

export class RecordVO extends BaseVO {
  public isRecord = true;
  public isFolder = false;

  public isFetching = false;

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

  constructor(voData: any, initChildren?: boolean, dataStatus?: DataStatus) {
    super(voData);

    if (initChildren) {
      console.log('record-vo.ts', 85, 'gonna build out these children');
    }

    if (dataStatus) {
      this.dataStatus = dataStatus;
    }
  }
}
