/* @format */
import { Component, HostBinding, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';

@Component({
  selector: 'pr-login',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  @HostBinding('class.pr-auth-form') classBinding = true;
  forgotForm: UntypedFormGroup;
  formErrors: any = {};

  waiting: boolean;
  success: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private api: ApiService,
    private router: Router,
    private message: MessageService,
    private cookies: CookieService,
  ) {
    this.forgotForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {}

  onSubmit(formValue: any) {
    this.waiting = true;

    this.api.auth
      .forgotPassword(formValue.email)
      .subscribe((response: AuthResponse) => {
        this.waiting = false;
        if (response.isSuccessful) {
          this.success = true;
        } else {
          this.message.showError({
            message: response.getMessage(),
            translate: true,
          });
        }
      });
  }
}
