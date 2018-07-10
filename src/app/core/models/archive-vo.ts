export class ArchiveVO {
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

  constructor (voData: any) {
    if (voData) {
      for ( const key in voData ) {
        if (voData[key]) {
          this[key] = voData[key];
        }
      }
    }
  }
}
