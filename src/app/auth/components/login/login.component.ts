import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { AccountService } from '../../../shared/services/account/account.service';
import { AuthResponse } from '../../../shared/services/api/auth.repo';
import { MessageService } from '../../../shared/services/message/message.service';

const MIN_PASSWORD_LENGTH = 10;

const FORM_ERROR_MESSAGES = {
  email: {
    email: 'Invalid email address',
    required: 'Email required'
  },
  password: {
    minlength: `Passwords must be ${MIN_PASSWORD_LENGTH} characters`,
    required: 'Password required'
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
    }, { updateOn: 'blur' });

    this.loginForm.statusChanges.subscribe(() => this.setErrorMessages());
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.logIn(formValue.email, formValue.password, formValue.rememberMe, formValue.keepLoggedIn)
      .then((response: AuthResponse) => {
        this.waiting = false;

        if (response.needsMFA()) {
          this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}`, 'warning');
          this.router.navigate(['/mfa']);
        } else if (response.needsVerification()) {
          this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}`, 'warning');
          this.router.navigate(['/verify']);
        } else {
          this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}`, 'success');
          this.router.navigate(['/app']);
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;

        if (response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage('Incorrect email or password', 'danger');
          this.loginForm.setErrors({unknown: true});
        } else {
          this.message.showMessage('Log in failed. Please try again.', 'danger');
        }
      });
  }

  setErrorMessages() {
    if (this.loginForm.valid) {
      this.formErrors = {};
      return;
    }

    for (const controlName in this.loginForm.controls) {
      if (this.loginForm.get(controlName) ) {
        const control = this.loginForm.get(controlName);
        if (control.touched && control.errors) {
          const errorName = Object.keys(control.errors).pop();
          this.formErrors[controlName] = FORM_ERROR_MESSAGES[controlName][errorName];
        } else {
          this.formErrors[controlName] = null;
        }
      }
    }
  }

}
