import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, AccountVO, NotificationPreferencesI } from '@models';
import { cloneDeep } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { AccountVOData } from '@models/account-vo';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  public account: AccountVO;
  public preferences: NotificationPreferencesI;
  constructor(
    private accountService: AccountService,
    private dataService: DataService,
    private api: ApiService,
    private message: MessageService
  ) {
    this.dataService.setCurrentFolder(new FolderVO({
      displayName: 'Account',
      pathAsText: ['Account'],
      type: 'page'
    }), true);

    this.account = this.accountService.getAccount();
    this.preferences = cloneDeep(this.account.notificationPreferences);
    console.log(this.preferences);
  }

  ngOnInit(): void {
  }

  async onSaveProfileInfo(prop: keyof AccountVO, value: any) {
    const originalValue = this.account[prop];
    const data: AccountVOData = { ...this.account };
    data[prop] = value;
    delete data.notificationPreferences;
    const updateAccountVo = new AccountVO(data);
    this.account.update(data);
    const response = await this.api.account.update(updateAccountVo);
    if (!response.isSuccessful) {
      const revertData = { ...this.account };
      revertData[prop] = originalValue;
      this.account.update(revertData);
      this.message.showError('There was a problem saving your account changes');
    } else {
      this.message.showMessage('Account information saved.', 'success');
    }
  }

  async onPreferenceChange(path: string[], value: boolean) {
    const response = await this.api.account.updateNotificationPreference(path.join('.'), value);
    if (response.isSuccessful) {

    }
  }

}
