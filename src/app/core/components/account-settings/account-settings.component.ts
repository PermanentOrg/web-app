import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, AccountVO, NotificationPreferencesI } from '@models';
import { cloneDeep } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';

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
    private api: ApiService
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

  async onPreferenceChange(path: string[], value: boolean) {
    const response = await this.api.account.updateNotificationPreference(path.join('.'), value);
    if (response.isSuccessful) {

    }
  }

}
