export class AccountVO {
  public accountId;
  public primaryEmail;
  public fullName;
  public address;
  public address2;
  public country;
  public city;
  public state;
  public zip;
  public primaryPhone;
  public defaultArchiveId;
  public level;
  public apiToken;
  public facebookAccountId;
  public googleAccountId;
  public status;
  public type;

  private agreed;
  private optIn;
  private emailArray;
  private inviteCode;
  private rememberMe;
  private keepLoggedIn;
  private accessRole;
  private spaceTotal;
  private spaceLeft;
  private fileTotal;
  private fileLeft;
  private changePrimaryEmail;
  private changePrimaryPhone;

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
