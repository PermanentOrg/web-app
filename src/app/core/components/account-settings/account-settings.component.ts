import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { AccountVO, AccountPasswordVOData } from '@models';
import { cloneDeep } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { AccountVOData } from '@models/account-vo';
import { MessageService } from '@shared/services/message/message.service';
import {
  PrConstantsService,
  Country,
} from '@shared/services/pr-constants/pr-constants.service';
import { FormInputSelectOption } from '@shared/components/form-input/form-input.component';
import { Router, ActivatedRoute } from '@angular/router';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
} from '@angular/forms';
import { AuthRepo, AuthResponse } from '@shared/services/api/auth.repo';
import { matchControlValidator } from '@shared/utilities/forms';
import {
  PromptField,
  PromptService,
} from '@shared/services/prompt/prompt.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';

@Component({
  selector: 'pr-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss'],
})
export class AccountSettingsComponent implements OnInit {
  public account: AccountVO;
  public countries: FormInputSelectOption[];
  public states: FormInputSelectOption[];

  public changePasswordForm: UntypedFormGroup;

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
    private analytics: AnalyticsService
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
      }
    );

    this.changePasswordForm = fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordOld: ['', [Validators.required, Validators.minLength(8)]],
    });

    const verifyPasswordControl = new UntypedFormControl('', [
      Validators.required,
      matchControlValidator(this.changePasswordForm.controls['password']),
    ]);
    this.changePasswordForm.addControl('passwordVerify', verifyPasswordControl);
  }

  ngOnInit(): void {
    this.analytics.notifyObservers({
      action: 'open_login_info',
      entity: 'account',
      version: 1,
      entityId: this.account.accountId.toString(),
      body: {
        analytics: {
          event: 'View Login Info',
          data: {
            page: 'Login info',
          },
        },
      },
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

  async onChangePasswordFormSubmit(value: AccountPasswordVOData) {
    this.waiting = true;
    let trustToken = null;

    try {
      try {
        const loginResp = await this.accountService.checkForMFAWithLogin(
          value.passwordOld
        );
        if (loginResp.needsMFA()) {
          try {
            const mfa = await this.showMFAPrompt();
            try {
              const keepLoggedIn =
                this.accountService.getAccount().keepLoggedIn;
              const mfaResp = await this.accountService.verifyMfa(
                mfa.verificationCode,
                keepLoggedIn
              );
              trustToken = mfaResp.getTrustToken().value;
            } catch (err) {
              this.message.showError({
                message: 'Incorrect verification code entered',
              });
              throw err;
            }
          } catch (err) {
            // They canceled out of the prompt, do nothing
            throw err;
          }
        }
      } catch (err) {
        throw err;
      }
      await this.api.auth.updatePassword(this.account, value, trustToken);
      this.message.showMessage({
        message: 'Password updated.',
        style: 'success',
      });
    } catch (err) {
      if (err instanceof AuthResponse) {
        this.message.showError({ message: err.getMessage(), translate: true });
      }
    } finally {
      this.waiting = false;
      this.changePasswordForm.reset();
    }
  }

  public async showMFAPrompt(): Promise<{ verificationCode: string }> {
    const mfaField: PromptField = {
      fieldName: 'verificationCode',
      placeholder: 'Verification Code',
      initialValue: '',
      type: 'text',
    };
    return this.prompt.prompt(
      [mfaField],
      'A verification code has been sent to your email address or phone number. Please enter it below to change your password.'
    );
  }
}
