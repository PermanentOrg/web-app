import { orderBy } from 'lodash';

import { BaseVO } from '@models/base-vo';
import { RecordVO } from '@models/record-vo';
import { DataStatus } from '@models/data-status.enum';

export class FolderVO extends BaseVO {
  public isFolder = true;
  public isRecord = false;

  public isFetching = false;

  public dataStatus = DataStatus.Placeholder;

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
  public pathAsFolder_linkId: number;
  public pathAsText;
  public folder_linkId: number;
  public parentFolder_linkId: number;
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

  constructor(voData: any, initChildren?: boolean, dataStatus?: DataStatus) {
    super(voData);

    this.ChildItemVOs = orderBy(this.ChildItemVOs, 'position');

    if (initChildren) {
      this.ChildItemVOs = this.ChildItemVOs.map((item) => {
        if (item.folderId) {
          return new FolderVO(item);
        } else {
          return new RecordVO(item);
        }
      });
    }

    if (dataStatus) {
      this.dataStatus = dataStatus;
    }
  }
}
