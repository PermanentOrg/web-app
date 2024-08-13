/* @format */
import { BaseVO, DynamicListChild } from '@models/base-vo';
import { FolderVO } from '@models/folder-vo';
import { RecordVO } from '@models/record-vo';
import { DataStatus } from '@models/data-status.enum';
import { AccessRoleType } from './access-role';
import { ItemVO } from '.';

export type ArchiveType =
  | 'type.archive.person'
  | 'type.archive.group'
  | 'type.archive.family'
  | 'type.archive.organization'
  | 'type.archive.nonprofit';

export class ArchiveVO extends BaseVO implements DynamicListChild {
  public archiveId;
  public archiveNbr;
  public ChildFolderVOs;
  public FolderSizeVOs;
  public RecordVOs;
  public accessRole: AccessRoleType;
  public fullName: string;
  public spaceTotal;
  public spaceLeft;
  public fileTotal;
  public fileLeft;
  public relationType;
  public homeCity;
  public homeState;
  public homeCountry;
  public ItemVOs: ItemVO[];
  public birthDay;
  public company;
  public description;
  public thumbURL200: string;
  public thumbURL500: string;
  public thumbURL1000: string;
  public thumbURL2000: string;
  public thumbArchiveNbr: string;
  public type: ArchiveType;
  public isPendingAction: boolean;
  public isNewlyCreated: boolean;
  public allowPublicDownload: boolean;
  public payerAccountId: string;
  public public: number;

  constructor(voData: any) {
    super(voData);

    if (this.ItemVOs && this.ItemVOs.length) {
      // remove null items
      this.ItemVOs = this.ItemVOs.filter((item) => item.type !== null).map(
        (item) => {
          if (item.type.includes('folder')) {
            return new FolderVO(item, false, DataStatus.Lean);
          } else {
            return new RecordVO(item, { dataStatus: DataStatus.Lean });
          }
        },
      );
    }
  }

  isPending() {
    return this.status ? this.status.includes('pending') : false;
  }
}
