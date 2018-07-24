import { BaseVO } from './base-vo';
import { RecordVO } from '@models/record-vo';

export class FolderVO extends BaseVO {
  public isFolder = true;
  public isRecord = false;
  public folderId;
  public archiveNbr;
  public archiveId;
  public displayName;
  public displayDT;
  public displayEndDT;
  public derivedDT;
  public derivedEndDT;

  public note;
  public description;
  public special;
  public sort;
  public locnId;
  public timeZoneId;
  public view;
  public viewProperty;
  public thumbArchiveNbr;
  public imageRatio;
  public type;

  // Thumbnails
  public thumbStatus;
  public thumbURL200;
  public thumbURL500;
  public thumbURL1000;
  public thumbURL2000;
  public thumbDT;

  public status;
  public publicDT;
  public parentFolderId;
  public folder_linkType;
  public FolderLinkVOs;
  public accessRole;
  public position;
  public shareDT;

  // For the iParentFolderVO
  public pathAsFolder_linkId;
  public pathAsText;
  public folder_linkId;
  public parentFolder_linkId;
  public ParentFolderVOs;
  public parentArchiveNbr;
  public pathAsArchiveNbr;

  // Children
  public ChildFolderVOs;
  public RecordVOs;
  public LocnVO;
  public TimezoneVO;
  public DirectiveVOs;
  public TagVOs;
  public SharedArchiveVOs;
  public FolderSizeVO;
  public AttachmentRecordVOs;
  public hasAttachments;
  public ChildItemVOs;
  public ShareVOs;
  public AccessVO;
  public AccessVOs;

  // For the UI
  public posStart;
  public posLimit;

  constructor(voData: any, initChildren?: boolean) {
    super(voData);

    if (initChildren) {
      this.ChildItemVOs = this.ChildItemVOs.map((item) => {
        if (item.folderId) {
          return new FolderVO(item);
        } else {
          return new RecordVO(item);
        }
      });
    }
  }
}
