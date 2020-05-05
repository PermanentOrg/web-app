import { orderBy } from 'lodash';

import { BaseVO, BaseVOData } from '@models/base-vo';
import { RecordVO } from '@models/record-vo';
import { DataStatus } from '@models/data-status.enum';
import { ShareVO } from '@models/share-vo';
import { isArray } from 'util';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { AccessRoleType } from './access-role';
import { TimezoneVOData } from './timezone-vo';

export interface ChildItemData {
  isFolder: boolean;
  isRecord: boolean;

  isFetching: boolean;
  fetched: Promise<boolean>;

  isPendingAction: boolean;
  dataStatus: DataStatus;
}

export type FolderViewType =
  'folder.view.grid' |
  'folder.view.list' |
  'folder.view.timeline'
  ;
export type SortType =
  'sort.display_date_asc' |
  'sort.display_date_desc' |
  'sort.alphabetical_asc' |
  'sort.alphabetical_desc' |
  'sort.type_asc' |
  'sort.type_desc'
  ;

export class FolderVO extends BaseVO implements ChildItemData {
  public isFolder = true;
  public isRecord = false;

  public isFetching = false;
  public fetched: Promise<boolean>;

  public isPendingAction = false;

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
  public sort: SortType;
  public locnId;
  public timeZoneId;
  public view: FolderView;
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
  public pathAsArchiveNbr: string[];

  // Children
  public ChildFolderVOs;
  public RecordVOs;
  public LocnVO;
  public TimezoneVO: TimezoneVOData;
  public DirectiveVOs;
  public TagVOs;
  public SharedArchiveVOs;
  public FolderSizeVO;
  public AttachmentRecordVOs;
  public hasAttachments;
  public ChildItemVOs: any;
  public ShareVOs: ShareVO[];
  public AccessVO;
  public AccessVOs;

  // For the UI
  public posStart;
  public posLimit;

  constructor(voData: FolderVOData, initChildren?: boolean, dataStatus?: DataStatus) {
    super(voData);

    // this.ChildItemVOs = orderBy(this.ChildItemVOs, 'position');

    if (initChildren) {
      this.ChildItemVOs = this.ChildItemVOs.map((item) => {
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
  }

  public update (voData: FolderVOData | FolderVO): void {
    if (voData) {
      for ( const key in voData ) {
        if (voData[key] !== undefined) {
          this[key] = voData[key];
        }
      }
    }

    if (this.ShareVOs) {
      this.ShareVOs = this.ShareVOs.map((data) => new ShareVO(data));
    }
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
  pathAsArchiveNbr?: string[];
  ChildFolderVOs?: any;
  RecordVOs?: any;
  LocnVO?: any;
  TimezoneVO?: any;
  DirectiveVOs?: any;
  TagVOs?: any;
  SharedArchiveVOs?: any;
  FolderSizeVO?: any;
  AttachmentRecordVOs?: any;
  hasAttachments?: any;
  ChildItemVOs?: any;
  ShareVOs?: any;
  AccessVO?: any;
  AccessVOs?: any;
  posStart?: any;
  posLimit?: any;
}
