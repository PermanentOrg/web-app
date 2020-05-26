import { BaseVO } from '@models/base-vo';
import { AccessRoleType } from './access-role';


interface NotificationTypes {
  alerts?: boolean;
  confirmations?: boolean;
  recommendations: true;
  security?: boolean;
}

interface NotificationPreference {
  account?: NotificationTypes;
  apps?: NotificationTypes;
  archive?: NotificationTypes;
  relationships?: NotificationTypes;
  share?: NotificationTypes;
  system?: NotificationTypes;
}

export interface NotificationPreferencesI {
  emailPreference?: NotificationPreference;
  inAppPreference?: NotificationPreference;
  textPreference?: NotificationPreference;
}

export class AccountVO extends BaseVO {
  public isCurrent: boolean;
  public isNew?: boolean;

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
  public accessRole: AccessRoleType;
  public spaceTotal;
  public spaceLeft;
  public fileTotal;
  public fileLeft;
  public changePrimaryEmail;
  public changePrimaryPhone;
  public emailStatus;
  public phoneStatus;
  public notificationPreferences: NotificationPreferencesI;

  constructor(voData) {
    super(voData);

    if (this.notificationPreferences && typeof this.notificationPreferences === 'string') {
      try {
        this.notificationPreferences = JSON.parse(this.notificationPreferences);
      } catch (err) {
        console.error('Error parsing account preferences');
      }
    }
  }
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
