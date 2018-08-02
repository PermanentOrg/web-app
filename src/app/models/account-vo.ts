import { BaseVO } from '@models/base-vo';

export class AccountVO extends BaseVO {
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
  public agreed;
  public optIn;
  public emailArray;
  public inviteCode;
  public rememberMe;
  public keepLoggedIn;
  public accessRole;
  public spaceTotal;
  public spaceLeft;
  public fileTotal;
  public fileLeft;
  public changePrimaryEmail;
  public changePrimaryPhone;

  needsVerification(): boolean {
    return this.status.includes('status.auth.need');
  }
}
