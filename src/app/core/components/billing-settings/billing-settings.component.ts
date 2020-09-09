import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, AccountVO, NotificationPreferencesI } from '@models';
import { cloneDeep } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { AccountVOData } from '@models/account-vo';
import { MessageService } from '@shared/services/message/message.service';
import { PrConstantsService, Country } from '@shared/services/pr-constants/pr-constants.service';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';

@Component({
  selector: 'pr-billing-settings',
  templateUrl: './billing-settings.component.html',
  styleUrls: ['./billing-settings.component.scss']
})
export class BillingSettingsComponent implements OnInit {
  public account: AccountVO;
  public countries: FormInputSelectOption[];
  public states: FormInputSelectOption[];

  constructor(
    private accountService: AccountService,
    private dataService: DataService,
    private prConstants: PrConstantsService,
    private api: ApiService,
    private message: MessageService
  ) {
    this.account = this.accountService.getAccount();
    this.countries = this.prConstants.getCountries().map(c => {
      return {
        text: c.name,
        value: c.abbrev
      };
    });
    this.states = Object.values(this.prConstants.getStates()).map((s: string) => {
      return {
        text: s,
        value: s
      };
    });
  }

  ngOnInit(): void {
  }

  async onSaveInfo(prop: keyof AccountVO, value: string) {
    const originalValue = this.account[prop];
    const data: AccountVOData = new AccountVO(this.account);
    data[prop] = value;
    delete data.notificationPreferences;
    const updateAccountVo = new AccountVO(data);
    this.account.update(data);
    const response = await this.api.account.update(updateAccountVo);
    if (!response.isSuccessful) {
      const revertData: AccountVOData = {};
      revertData[prop] = originalValue;
      this.account.update(revertData);
      this.message.showError('There was a problem saving your account changes');
    } else {
      this.message.showMessage('Account information saved.', 'success');
    }
  }
}
