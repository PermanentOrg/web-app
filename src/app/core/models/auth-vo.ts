export class AuthVO {
  public authId;
  public accountId;
  public archiveId;
  public token;
  public expiresDT;
  public ipAddress;
  public status;
  public type;

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
