import { BaseVO } from '@models/base-vo';

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
}
