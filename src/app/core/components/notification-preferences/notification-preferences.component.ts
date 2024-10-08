/* @format */
import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { AccountVO, NotificationPreferencesI } from '@models';
import { cloneDeep } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-notification-preferences',
  templateUrl: './notification-preferences.component.html',
  styleUrls: ['./notification-preferences.component.scss'],
})
export class NotificationPreferencesComponent {
  public account: AccountVO;
  public preferences: NotificationPreferencesI;
  constructor(
    private accountService: AccountService,
    private dataService: DataService,
    private api: ApiService,
    private message: MessageService,
  ) {
    this.account = this.accountService.getAccount();
    this.preferences = cloneDeep(this.account.notificationPreferences);
  }

  async onPreferenceChange(path: string[], value: boolean) {
    const response = await this.api.account.updateNotificationPreference(
      path.join('.'),
      value,
    );
    if (response.isSuccessful) {
    }
  }
}
