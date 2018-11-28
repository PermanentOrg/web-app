import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import APP_CONFIG from '@root/app/app.config';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

export const FORM_ERROR_MESSAGES = {
  email: {
    email: 'Invalid email address.',
    required: 'Email required.'
  },
  password: {
    minlength: `Passwords must be ${MIN_PASSWORD_LENGTH} characters.`,
    required: 'Password required.'
  }
};

@Component({
  selector: 'pr-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  waiting: boolean;
  formErrors: any = {};

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private message: MessageService,
    private cookies: CookieService
  ) {
    this.loginForm = fb.group({
      email: [this.cookies.get('rememberMe'), [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      rememberMe: [true],
      keepLoggedIn: [true]
    });
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.logIn(formValue.email, formValue.password, formValue.rememberMe, formValue.keepLoggedIn)
      .then((response: AuthResponse) => {
        if (response.needsMFA()) {
          this.router.navigate(['/auth', 'mfa'])
            .then(() => {
              this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}.`, 'warning');
            });
        } else if (response.needsVerification()) {
          this.router.navigate(['/auth', 'verify'])
            .then(() => {
              this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}.`, 'warning');
            });
        } else {
          this.router.navigate(['/'])
            .then(() => {
              this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}.`, 'success');
            });
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;

        if (response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage('Incorrect email or password.', 'danger');
          this.loginForm.setErrors({unknown: true});
        } else {
          this.message.showMessage('Log in failed. Please try again.', 'danger');
        }
      });
  }
}
