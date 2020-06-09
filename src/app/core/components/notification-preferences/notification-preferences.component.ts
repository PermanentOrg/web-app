import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, AccountVO, NotificationPreferencesI } from '@models';
import { cloneDeep } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-notification-preferences',
  templateUrl: './notification-preferences.component.html',
  styleUrls: ['./notification-preferences.component.scss']
})
export class NotificationPreferencesComponent implements OnInit {
  public account: AccountVO;
  public preferences: NotificationPreferencesI;
  constructor(
    private accountService: AccountService,
    private dataService: DataService,
    private api: ApiService,
    private message: MessageService
  ) {
    this.dataService.setCurrentFolder(new FolderVO({
      displayName: 'Notification Preferences',
      pathAsText: ['Notification Preferences'],
      type: 'page'
    }), true);

    this.account = this.accountService.getAccount();
    this.preferences = cloneDeep(this.account.notificationPreferences);
  }

  ngOnInit(): void {
  }

  async onPreferenceChange(path: string[], value: boolean) {
    const response = await this.api.account.updateNotificationPreference(path.join('.'), value);
    if (response.isSuccessful) {

    }
  }

}
