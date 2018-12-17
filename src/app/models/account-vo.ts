import { BaseVO } from '@models/base-vo';

export class AccountVO extends BaseVO {
  public isCurrent: boolean;

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
  public emailStatus;
  public phoneStatus;

  needsVerification(): boolean {
    return this.status && this.status.includes('status.auth.need');
  }

  phoneNeedsVerification(): boolean {
    return this.phoneStatus === 'status.auth.unverified';
  }

  emailNeedsVerification(): boolean {
    return this.emailStatus === 'status.auth.unverified';
  }
}
