export class AccountPasswordVO {
  public account_passwordId;
  public accountId;
  public password;
  public status;

  private passwordOld;
  private passwordVerify;

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
