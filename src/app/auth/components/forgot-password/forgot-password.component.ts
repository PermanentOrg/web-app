import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';

const FORM_ERROR_MESSAGES = {
  email: {
    email: 'Invalid email address',
    required: 'Email required'
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
  formErrors: any = {};

  waiting: boolean;
  success: boolean;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private message: MessageService,
    private cookies: CookieService
  ) {
    this.forgotForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
    }, { updateOn: 'blur' });
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.api.auth.forgotPassword(formValue.email)
      .subscribe((response: AuthResponse) => {
        this.waiting = false;
        if (response.isSuccessful) {
          this.success = true;
        } else {
          this.message.showError(response.getMessage(), true);
        }
      });
  }
}
