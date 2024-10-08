/* @format */
import { Component, HostBinding, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import {
  AuthResponse,
  ArchiveResponse,
  AccountResponse,
} from '@shared/services/api/index.repo';
import { AccountVO } from '@root/app/models';
import { SecretsService } from '@shared/services/secrets/secrets.service';
import { RecaptchaErrorParameters } from 'ng-recaptcha';
import { EventService } from '@shared/services/event/event.service';

@Component({
  selector: 'pr-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {
  @HostBinding('class.pr-auth-form') classBinding = true;
  verifyForm: UntypedFormGroup;
  formTitle = 'Verify Email';
  waiting: boolean;

  verifyingEmail = true;
  verifyingPhone = false;

  needsEmail: boolean;
  needsPhone: boolean;

  public captchaEnabled: boolean;
  public captchaSiteKey: string;
  public captchaPassed: boolean;

  public readonly showCaptchaForEmail = false;

  constructor(
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private router: Router,
    private message: MessageService,
    private route: ActivatedRoute,
    public secrets: SecretsService,
    private event: EventService,
  ) {
    this.captchaPassed = false;
    this.captchaSiteKey = secrets.get('RECAPTCHA_API_KEY');
    this.captchaEnabled = this.captchaSiteKey !== '';

    const account = this.accountService.getAccount();

    if (!account) {
      this.router.navigate(['/auth', 'login'], {
        queryParamsHandling: 'preserve',
      });
      return;
    }

    this.needsEmail = account.emailNeedsVerification();
    this.needsPhone = account.phoneNeedsVerification();

    const queryParams = route.snapshot.queryParams;

    this.verifyForm = fb.group({
      token: [queryParams.token || ''],
    });

    if (queryParams) {
      if (this.canSendCodes('email')) {
        if (queryParams.sendEmail) {
          this.accountService.resendEmailVerification();
        }
      }

      if (this.canSendCodes('phone')) {
        if (queryParams.sendSms) {
          this.accountService.resendPhoneVerification();
        }
      }
    }

    if (queryParams.email) {
      // decode the url encoding from the php
      const query_email = decodeURI(queryParams.email);
      if (query_email !== account.primaryEmail) {
        this.message.showError({
          message: 'Sorry, this verification code does not match your account.',
          translate: true,
          navigateTo: ['/auth/', 'login'],
        });
        this.verifyForm.patchValue({ token: '' });
        this.waiting = true;
      }
    }

    if (!this.needsEmail && this.needsPhone) {
      this.verifyingEmail = false;
      this.verifyingPhone = true;
      this.formTitle = 'Verify Phone Number';
    } else if (!this.needsEmail) {
      this.router.navigate(['/private'], { queryParamsHandling: 'preserve' });
    }
  }

  ngOnInit() {
    this.event.dispatch({
      entity: 'account',
      action: 'open_verify_email',
      account: this.accountService.getAccount(),
    });
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    let verifyPromise: Promise<AuthResponse>;

    if (this.verifyingEmail) {
      verifyPromise = this.accountService.verifyEmail(formValue.token);
    } else if (this.verifyingPhone) {
      verifyPromise = this.accountService.verifyPhone(formValue.token);
    } else {
      return;
    }

    return verifyPromise
      .then((response: AuthResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        this.waiting = false;

        const keepLoggedIn = this.keepLoggedIn();
        const account = new AccountVO({
          ...response.getAccountVO(),
          keepLoggedIn,
        });
        this.accountService.setAccount(account);

        this.needsEmail = account.emailNeedsVerification();
        this.needsPhone = account.phoneNeedsVerification();

        if (this.needsPhone) {
          this.verifyForm.controls['token'].setValue('');
          this.verifyingEmail = false;
          this.verifyingPhone = true;
          this.formTitle = 'Verify Phone Number';
        } else {
          this.finish();
        }
      })
      .catch((response: AuthResponse | ArchiveResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError({
          message: response.getMessage(),
          translate: true,
        });
      });
  }

  resendCode(showMessage = true) {
    this.waiting = true;

    let resendPromise: Promise<AuthResponse>;
    if (this.verifyingEmail) {
      if (this.canSendCodes('email')) {
        resendPromise = this.accountService.resendEmailVerification();
      }
    } else {
      if (this.canSendCodes('phone')) {
        resendPromise = this.accountService.resendPhoneVerification();
      }
    }

    resendPromise
      .then((response: AuthResponse) => {
        this.waiting = false;
        if (showMessage) {
          this.message.showMessage({
            message: response.getMessage(),
            translate: true,
          });
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;
        let translateString = response.getMessage();
        if (translateString === 'error.auth.lookup') {
          translateString = 'warning.auth.token_does_not_match';
        }
        this.message.showError({ message: translateString, translate: true });
      });
  }

  finish() {
    return this.accountService
      .switchToDefaultArchive()
      .then((response: ArchiveResponse) => {
        this.message.showMessage({
          message: `${
            this.verifyingEmail ? 'Email' : 'Phone number'
          } verified.`,
          style: 'success',
        });
        if (this.route.snapshot.queryParams.shareByUrl) {
          this.router
            .navigate(['/share', this.route.snapshot.queryParams.shareByUrl])
            .then(() => {
              this.message.showMessage({
                message: `Logged in as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                style: 'success',
              });
            });
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  public resolveCaptcha(response: string): void {
    this.captchaPassed = true;
    if (this.canSendCodes('phone')) {
      this.resendCode(false);
    }
  }

  public onCaptchaError(error: RecaptchaErrorParameters): void {
    this.captchaPassed = false;
  }

  public canSendCodes(codeType: 'email' | 'phone'): boolean {
    if (codeType === 'email') {
      return !this.showCaptchaForEmail || this.canSendCodes('phone');
    }
    return this.captchaEnabled ? this.captchaPassed : true;
  }

  private keepLoggedIn(): boolean {
    return this.accountService.getAccount().keepLoggedIn;
  }
}
