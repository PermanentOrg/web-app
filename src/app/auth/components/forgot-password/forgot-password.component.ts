import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';

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
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  waiting: boolean;
  formErrors: any = {};

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private message: MessageService,
    private cookies: CookieService
  ) {
    this.forgotForm = fb.group({
      email: [this.cookies.get('rememberMe'), [Validators.required, Validators.email]],
    }, { updateOn: 'blur' });

    this.forgotForm.statusChanges.subscribe(() => this.setErrorMessages());
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.api.auth.forgotPassword(formValue.email)
      .subscribe((response: AuthResponse) => {
        this.waiting = false;
        console.log(response);
      });
  }

  setErrorMessages() {
    if (this.forgotForm.valid) {
      this.formErrors = {};
      return;
    }

    for (const controlName in this.forgotForm.controls) {
      if (this.forgotForm.get(controlName) ) {
        const control = this.forgotForm.get(controlName);
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
