import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import * as FormUtilities from '@shared/utilities/forms';

import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';

const MIN_PASSWORD_LENGTH = 10;

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
        confirm: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]]
      },
      { validator: [Validators.required, FormUtilities.matchValidator], updateOn: 'blur' });

    this.resetForm.statusChanges.subscribe(() => FormUtilities.setFormErrors(this.resetForm, this.formErrors));
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
