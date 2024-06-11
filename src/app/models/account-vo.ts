/* @format */
import { BaseVO, BaseVOData } from '@models/base-vo';
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

export interface AccountVOData extends BaseVOData {
  accountId?: number;
  primaryEmail?: string;
  fullName?: string;
  address?: string;
  address2?: string;
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  primaryPhone?: string;
  defaultArchiveId?: any;
  betaParticipant?: any;
  status?: any;
  type?: any;
  agreed?: any;
  optIn?: any;
  emailArray?: any;
  inviteCode?: any;
  rememberMe?: any;
  keepLoggedIn?: any;
  accessRole?: AccessRoleType;
  spaceTotal?: any;
  spaceLeft?: any;
  fileTotal?: any;
  fileLeft?: any;
  changePrimaryEmail?: any;
  changePrimaryPhone?: any;
  emailStatus?: any;
  phoneStatus?: any;
  notificationPreferences?: NotificationPreferencesI;
  allowSftpDeletion?: boolean;
  hideChecklist?: boolean;
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
  public betaParticipant;
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
  public allowSftpDeletion;
  public hideChecklist: boolean;

  constructor(voData: AccountVOData) {
    super(voData);

    if (
      this.notificationPreferences &&
      typeof this.notificationPreferences === 'string'
    ) {
      this.notificationPreferences = JSON.parse(this.notificationPreferences);
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
