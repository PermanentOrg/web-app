import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import APP_CONFIG from '@root/app/app.config';

import * as FormUtilities from '@shared/utilities/forms';

import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
  selector: 'pr-login',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class ResetPasswordComponent implements OnInit {
  accountId: number;
  token: string;
  resetForm: FormGroup;
  formErrors: any = {};

  waiting: boolean;
  success: boolean;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService
  ) {
    this.resetForm = fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      },
      { validator: [Validators.required], updateOn: 'change' }
    );

    const confirmPasswordControl = new FormControl(
      '',
      [Validators.required, FormUtilities.matchControlValidator(this.resetForm.controls['password'])]
    );
    this.resetForm.addControl('confirm', confirmPasswordControl);
  }

  ngOnInit() {
    this.accountId = Number(this.route.snapshot.params.accountId);
    this.token = this.route.snapshot.params.token;
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.api.auth.changePassword(this.accountId, this.token, formValue.password, formValue.confirm)
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
