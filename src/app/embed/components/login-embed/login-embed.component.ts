/* @format */
import { Component, HostBinding, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { APP_CONFIG } from '@root/app/app.config';
import { matchControlValidator } from '@shared/utilities/forms';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { AccountResponse } from '@shared/services/api/index.repo';

import * as FormUtilities from '@shared/utilities/forms';
import { IFrameService } from '@shared/services/iframe/iframe.service';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
  selector: 'pr-login',
  templateUrl: './login-embed.component.html',
  styleUrls: ['./login-embed.component.scss'],
})
export class LoginEmbedComponent implements OnInit {
  @HostBinding('class.pr-auth-form') classBinding = true;
  loginForm: UntypedFormGroup;
  waiting: boolean;
  inviteCode: string;

  formErrors = {
    email: false,
    password: false,
  };

  constructor(
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService,
    private iFrame: IFrameService,
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams.invite) {
      this.inviteCode = queryParams.invite;
    }

    this.loginForm = fb.group({
      email: [
        '',
        [FormUtilities.trimWhitespace, Validators.required, Validators.email],
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)],
      ],
      rememberMe: [true],
      keepLoggedIn: [true],
    });

    const currentAccount = this.accountService.getAccount();
    if (currentAccount && currentAccount.primaryEmail) {
      this.iFrame.setParentUrl('/app');
    }
  }

  ngOnInit() {}

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService
      .logIn(
        formValue.email,
        formValue.password,
        formValue.rememberMe,
        formValue.keepLoggedIn,
      )
      .then((response: AuthResponse) => {
        if (response.needsMFA()) {
          this.router
            .navigate(['..', 'mfa'], { relativeTo: this.route })
            .then(() => {
              this.message.showMessage({
                message: `Verify to continue as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                style: 'warning',
              });
            });
        } else if (response.needsVerification()) {
          this.router
            .navigate(['..', 'verify'], { relativeTo: this.route })
            .then(() => {
              this.message.showMessage({
                message: `Verify to continue as ${
                  this.accountService.getAccount().primaryEmail
                }.`,
                style: 'warning',
              });
            });
        } else {
          this.iFrame.setParentUrl('/app');
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;

        if (response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage({
            message: 'Incorrect email or password.',
            style: 'danger',
          });
          this.loginForm.patchValue({
            password: '',
          });
        } else {
          this.message.showMessage({
            message: 'Log in failed. Please try again.',
            style: 'danger',
          });
        }
      });
  }
}
