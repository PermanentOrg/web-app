import { BaseVOData } from './base-vo';

export interface AccountPasswordVOData extends BaseVOData {
  account_passwordId?: number;
  accountId?: number;
  password?: string;
  status?: string;

  passwordOld?: string;
  passwordVerify?: string;
}

export class AccountPasswordVO implements AccountPasswordVOData {
  public account_passwordId;
  public accountId;
  public password;
  public status;
  public passwordOld;
  public passwordVerify;

  constructor(voData: any) {
    if (voData) {
      for (const key in voData) {
        if (voData[key]) {
          this[key] = voData[key];
        }
      }
    }
  }
}
