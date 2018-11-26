import { BaseVO } from '@models/base-vo';
import { FolderVO } from '@models/folder-vo';
import { RecordVO } from '@models/record-vo';
import { DataStatus } from '@models/data-status.enum';

export class ArchiveVO extends BaseVO {
  public archiveId;
  public archiveNbr;
  public ChildFolderVOs;
  public FolderSizeVOs;
  public RecordVOs;
  public accessRole;
  public fullName;
  public spaceTotal;
  public spaceLeft;
  public fileTotal;
  public fileLeft;
  public relationType;
  public homeCity;
  public homeState;
  public homeCountry;
  public ItemVOs;
  public birthDay;
  public company;
  public thumbURL200;
  public thumbURL500;
  public thumbURL1000;
  public thumbURL2000;

  constructor(voData: any) {
    super(voData);

    if (this.ItemVOs && this.ItemVOs.length) {
      this.ItemVOs = this.ItemVOs.map((item) => {
        if (item.type.includes('folder')) {
          return new FolderVO(item, false, DataStatus.Lean);
        } else {
          return new RecordVO(item, false, DataStatus.Lean);
        }
      });
    }
  }

  isPending() {
    return this.status ? this.status.includes('pending') : false;
  }
}
