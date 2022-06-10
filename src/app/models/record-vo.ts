import { BaseVO, BaseVOData, DynamicListChild } from '@models/base-vo';
import { DataStatus } from '@models/data-status.enum';
import { ShareVO, sortShareVOs } from '@models/share-vo';
import { AccessRoleType } from './access-role';
import { TimezoneVOData } from './timezone-vo';
import { ChildItemData, HasParentFolder } from './folder-vo';
import { RecordType, FolderLinkType } from './vo-types';
import { formatDateISOString } from '@shared/utilities/dateTime';
import { LocnVOData } from './locn-vo';
import { TagVOData } from './tag-vo';
import { ArchiveVO } from './archive-vo';
import { orderBy } from 'lodash';

export class RecordVO extends BaseVO implements ChildItemData, HasParentFolder, DynamicListChild {
  public cleanParams = ['recordId', 'archiveNbr', 'folder_linkId', 'parentFolder_linkId', 'parentFolderId', 'uploadFileName'];
  public isRecord = true;
  public isFolder = false;

  public isFetching = false;
  public fetched: Promise<boolean>;

  public isPendingAction = false;
  public isNewlyCreated = false;

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
  public type: RecordType;

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
  public accessRole: AccessRoleType;
  public folderArchiveId: number;
  public folder_linkType: FolderLinkType;

  // For the iParentFolderVO
  public pathAsFolder_linkId;
  public pathAsText;
  public parentFolder_linkId;
  public ParentFolderVOs;
  public parentArchiveNbr: string;
  public parentDisplayName: string;
  public pathAsArchiveNbr;

  // Other stuff
  public LocnVO: LocnVOData;
  public TimezoneVO: TimezoneVOData;
  public FileVOs;
  public TagVOs: TagVOData[];
  public TextDataVOs;
  public ArchiveVOs: ArchiveVO[];
  public ShareArchiveVO: ArchiveVO;
  public saveAs;
  public uploadUri;
  public fileDurationInSecs;
  public RecordExifVO;
  public ShareVOs: ShareVO[];
  public AccessVO;

  constructor(voData: RecordVOData, initChildren?: boolean, dataStatus?: DataStatus) {
    super(voData);

    if (this.ShareVOs) {
      this.ShareVOs = sortShareVOs(this.ShareVOs.map((data) => new ShareVO(data)));
    }

    if (dataStatus) {
      this.dataStatus = dataStatus;
    }

    this.formatDates();
  }

  private formatDates() {
    this.displayDT = formatDateISOString(this.displayDT);
    this.displayEndDT = formatDateISOString(this.displayEndDT);
    this.derivedDT = formatDateISOString(this.derivedDT);
    this.derivedEndDT = formatDateISOString(this.derivedEndDT);
  }

  public update (voData: RecordVOData | RecordVO): void {
    if (voData) {
      for ( const key in voData ) {
        if (voData[key] !== undefined && typeof voData[key] !== 'function') {
          this[key] = voData[key];
        }
      }
    }

    if (this.ShareVOs) {
      this.ShareVOs = this.ShareVOs.map((data) => new ShareVO(data));
    }
  }
}

export interface RecordVOData extends BaseVOData {
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
  accessRole?: AccessRoleType;
  folderArchiveId?: number;
  folder_linkType?: any;
  pathAsFolder_linkId?: any;
  pathAsText?: any;
  parentFolder_linkId?: any;
  ParentFolderVOs?: any;
  parentArchiveNbr?: any;
  parentDisplayName?: string;
  pathAsArchiveNbr?: any;
  LocnVO?: any;
  TimezoneVO?: TimezoneVOData;
  FileVOs?: any;
  TagVOs?: any;
  TextDataVOs?: any;
  ArchiveVOs?: ArchiveVO[];
  ShareArchiveVO?: ArchiveVO;
  saveAs?: any;
  uploadUri?: any;
  fileDurationInSecs?: any;
  RecordExifVO?: any;
  ShareVOs?: any;
  AccessVO?: any;
}
