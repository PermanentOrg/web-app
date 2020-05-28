import { BaseVO, BaseVOData } from '@models/base-vo';
import { RecordVO } from '@models/record-vo';
import { DataStatus } from '@models/data-status.enum';
import { ShareVO } from '@models/share-vo';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { AccessRoleType } from './access-role';
import { TimezoneVOData } from './timezone-vo';
import { ItemVO, ArchiveVO } from '.';
import { FolderType, SortType, FolderLinkType } from './vo-types';
import { formatDateISOString } from '@shared/utilities/dateTime';
import { LocnVOData } from './locn-vo';
import { TagVOData } from './tag-vo';

export interface HasParentFolder {
  parentDisplayName?: string;
}

export interface ChildItemData {
  isFolder: boolean;
  isRecord: boolean;

  isFetching: boolean;
  fetched: Promise<boolean>;
  dataStatus: DataStatus;

  isPendingAction: boolean;
  isNewlyCreated: boolean;
}

export class FolderVO extends BaseVO implements ChildItemData, HasParentFolder {
  public isFolder = true;
  public isRecord = false;

  public isFetching = false;
  public fetched: Promise<boolean>;
  public dataStatus = DataStatus.Placeholder;

  public isPendingAction = false;
  public isNewlyCreated = false;

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
  public sort: SortType;
  public locnId;
  public timeZoneId;
  public view: FolderView;
  public viewProperty;
  public thumbArchiveNbr;
  public imageRatio;
  public type: FolderType;

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
  public folder_linkType: FolderLinkType;
  public FolderLinkVOs;
  public accessRole: AccessRoleType;
  public position;
  public shareDT;

  // For the iParentFolderVO
  public pathAsFolder_linkId: number[];
  public pathAsText: string[];
  public folder_linkId: number;
  public parentFolder_linkId: number;
  public ParentFolderVOs;
  public parentArchiveNbr;
  public parentDisplayName: string;
  public pathAsArchiveNbr: string[];

  // Children
  public ChildFolderVOs;
  public RecordVOs;
  public LocnVO: LocnVOData;
  public TimezoneVO: TimezoneVOData;
  public DirectiveVOs;
  public TagVOs: TagVOData[];
  public SharedArchiveVOs;
  public FolderSizeVO: FolderSizeVOData;
  public AttachmentRecordVOs;
  public hasAttachments;
  public ChildItemVOs: ItemVO[];
  public ShareVOs: ShareVO[];
  public ArchiveVOs: ArchiveVO[];
  public AccessVO;
  public AccessVOs;

  // For the UI
  public posStart;
  public posLimit;

  constructor(voData: FolderVOData, initChildren?: boolean, dataStatus?: DataStatus) {
    super(voData);

    if (initChildren) {
      this.ChildItemVOs = this.ChildItemVOs.map((item: any) => {
        if (item.folderId) {
          return new FolderVO(item, false);
        } else {
          return new RecordVO(item);
        }
      });
    }

    if (this.ShareVOs) {
      this.ShareVOs = this.ShareVOs.map((data) => new ShareVO(data));
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

  public update (voData: FolderVOData | FolderVO, keepChildItems = false): void {
    if (voData) {
      for ( const key in voData ) {
        if (keepChildItems && key === 'ChildItemVOs') {
          continue;
        }

        if (voData[key] !== undefined && typeof voData[key] !== 'function') {
          this[key] = voData[key];
        }
      }
    }

    if (this.ShareVOs) {
      this.ShareVOs = this.ShareVOs.map((data) => new ShareVO(data));
    }

    this.formatDates();
  }
}

export interface FolderVOData extends BaseVOData {
  folderId?: any;
  archiveNbr?: any;
  archiveArchiveNbr?: any;
  archiveId?: any;
  displayName?: any;
  displayDT?: any;
  displayEndDT?: any;
  derivedDT?: any;
  derivedEndDT?: any;
  note?: any;
  description?: any;
  special?: any;
  sort?: any;
  locnId?: any;
  timeZoneId?: any;
  view?: any;
  viewProperty?: any;
  thumbArchiveNbr?: any;
  imageRatio?: any;
  type?: any;
  thumbStatus?: any;
  thumbURL200?: any;
  thumbURL500?: any;
  thumbURL1000?: any;
  thumbURL2000?: any;
  thumbDT?: any;
  status?: any;
  publicDT?: any;
  parentFolderId?: any;
  folder_linkType?: any;
  FolderLinkVOs?: any;
  accessRole?: AccessRoleType;
  position?: any;
  shareDT?: any;
  pathAsFolder_linkId?: number[];
  pathAsText?: string[];
  folder_linkId?: number;
  parentFolder_linkId?: number;
  ParentFolderVOs?: any;
  parentArchiveNbr?: any;
  parentDisplayName?: string;
  pathAsArchiveNbr?: string[];
  ChildFolderVOs?: any;
  RecordVOs?: any;
  LocnVO?: any;
  TimezoneVO?: TimezoneVOData;
  DirectiveVOs?: any;
  TagVOs?: any;
  SharedArchiveVOs?: any;
  ArchiveVOs?: ArchiveVO[];
  FolderSizeVO?: FolderSizeVOData;
  AttachmentRecordVOs?: any;
  hasAttachments?: any;
  ChildItemVOs?: any;
  ShareVOs?: any;
  AccessVO?: any;
  AccessVOs?: any;
  posStart?: any;
  posLimit?: any;
}

export interface FolderSizeVOData {
  folder_sizeId;
  folder_linkId;
  archiveId;
  folderId;
  parentFolder_linkId;
  parentFolderId;

  myFileSizeShallow;
  myFileSizeDeep;

  myFolderCountShallow;
  myFolderCountDeep;

  myRecordCountShallow;
  myRecordCountDeep;

  myAudioCountShallow;
  myAudioCountDeep;

  myDocumentCountShallow;
  myDocumentCountDeep;

  myExperienceCountShallow;
  myExperienceCountDeep;

  myImageCountShallow;
  myImageCountDeep;

  myVideoCountShallow;
  myVideoCountDeep;

  allFileSizeShallow;
  allFileSizeDeep;

  allFolderCountShallow;
  allFolderCountDeep;

  allRecordCountShallow;
  allRecordCountDeep;

  allAudioCountShallow;
  allAudioCountDeep;

  allDocumentCountShallow;
  allDocumentCountDeep;

  allExperienceCountShallow;
  allExperienceCountDeep;

  allImageCountShallow;
  allImageCountDeep;

  allVideoCountShallow;
  allVideoCountDeep;

  lastExecuteDT;
  lastExecuteReason;
  nextExecuteDT;

  displayName;
  description;

  type;
  status;
  position;
}
