/* @format */
import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { AccountVO, AccountPasswordVOData } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { AccountVOData } from '@models/account-vo';
import { MessageService } from '@shared/services/message/message.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { Router, ActivatedRoute } from '@angular/router';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
} from '@angular/forms';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { matchControlValidator } from '@shared/utilities/forms';
import {
  PromptField,
  PromptService,
} from '@shared/services/prompt/prompt.service';
import { EventService } from '@shared/services/event/event.service';

@Component({
  selector: 'pr-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
})
export class AccountSettingsComponent implements OnInit {
  public account: AccountVO;
  public countries: FormInputSelectOption[];
  public states: FormInputSelectOption[];
  public waiting = false;

  constructor(
    private accountService: AccountService,
    private dataService: DataService,
    private prConstants: PrConstantsService,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private message: MessageService,
    private fb: UntypedFormBuilder,
    private prompt: PromptService,
    private event: EventService,
  ) {
    this.account = this.accountService.getAccount();
    this.countries = this.prConstants.getCountries().map((c) => {
      return {
        text: c.name,
        value: c.abbrev,
      };
    });
    this.states = Object.values(this.prConstants.getStates()).map(
      (s: string) => {
        return {
          text: s,
          value: s,
        };
      },
    );
  }

  ngOnInit(): void {
    this.event.dispatch({
      action: 'open_login_info',
      entity: 'account',
    });
  }

  async onSaveProfileInfo(prop: keyof AccountVO, value: string) {
    const originalValue = this.account[prop];
    const data: AccountVOData = new AccountVO(this.account);
    data[prop] = value;
    delete data.notificationPreferences;
    const updateAccountVo = new AccountVO(data);
    this.account.update(data);
    try {
      const response = await this.api.account.update(updateAccountVo);
      this.account.update(response.getAccountVO());
      this.accountService.setAccount(this.account);
      this.message.showMessage({
        message: 'Account information saved.',
        style: 'success',
      });
    } catch (err) {
      const revertData: AccountVOData = {};
      revertData[prop] = originalValue;
      this.account.update(revertData);
      this.message.showError({
        message: 'There was a problem saving your account changes',
      });
    }
  }

  async onValidateEmailClick() {
    await this.router.navigate(['.'], { relativeTo: this.route.parent });
    await this.router.navigate(['/app/auth/verify'], {
      relativeTo: this.route.parent,
      queryParams: { sendEmail: true },
    });
  }

  async onValidatePhoneClick() {
    await this.router.navigate(['.'], { relativeTo: this.route.parent });
    await this.router.navigate(['/app/auth/verify'], {
      relativeTo: this.route.parent,
      queryParams: { sendSms: true },
    });
  }
}
