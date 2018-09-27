import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import APP_CONFIG from '@root/app/app.config';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { AccountResponse } from '@shared/services/api/index.repo';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

export const FORM_ERROR_MESSAGES = {
  invitation: {
    required: 'Invitation code required'
  },
  name: {
    required: 'Name required'
  },
  email: {
    email: 'Invalid email address',
    required: 'Email required'
  },
  passwords: {
    minlength: `Passwords must be ${MIN_PASSWORD_LENGTH} characters`,
    required: 'Password required',
    mismatch: 'Passwords must match'
  }
};

@Component({
  selector: 'pr-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  waiting: boolean;
  formErrors: any = {
    name: false,
    invitation: false,
    email: false,
    passwords: false,
  };

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private message: MessageService
  ) {
    const params = route.snapshot.queryParams;

    let name, email, inviteCode;

    if (params.fullName) {
      name = window.atob(params.fullName);
    }

    if (params.primaryEmail) {
      email = window.atob(params.primaryEmail);
    }

    if (params.inviteCode) {
      inviteCode = window.atob(params.inviteCode);
    }

    this.signupForm = fb.group({
      invitation: [inviteCode || '', [Validators.required]],
      email: [email || '', [Validators.required, Validators.email]],
      name: [name || '', Validators.required],
      passwords: fb.group({
        password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
        confirm: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]]
      }, { validator: [Validators.required, this.matchValidator] }),
      agreed: ['', [Validators.required]],
      optIn: [true]
    }, { updateOn: 'blur' });

    this.signupForm.statusChanges.subscribe(() => this.setErrorMessages());
  }

  ngOnInit() {
  }

  matchValidator(group: FormGroup) {
    let errors: any;

    if (!group.controls['password'].value) {
      errors = { required: true };
      group.controls['confirm'].setErrors(errors);
      return errors;
    }

    if (group.controls['password'].errors && group.controls['password'].errors.minlength) {
      errors = { minlength: true};
      return errors;
    }

    const match = group.controls['password'].value === group.controls['confirm'].value;

    if (match && group.value.confirm) {
      group.controls['confirm'].setErrors(null);
      return null;
    }

    errors = { mismatch: true };
    group.controls['confirm'].setErrors(errors);

    return errors;
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.signUp(
      formValue.email, formValue.name, formValue.passwords.password, formValue.passwords.confirm,
      formValue.agreed, formValue.optIn, null, formValue.invitation
    ).then((response: AccountResponse) => {
        const account = response.getAccountVO();
        if (account.needsVerification()) {
          this.message.showMessage(`Verify to continue as ${account.primaryEmail}`, 'warning');
          this.router.navigate(['/verify']);
        } else {
          this.accountService.logIn(formValue.email, formValue.passwords.password, true, true)
            .then(() => {
              this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}`, 'success');
              this.router.navigate(['/']);
            });
        }
      })
      .catch((response: AccountResponse) => {
        this.message.showError(response.getMessage(), true);
        this.waiting = false;
      });
  }

  setErrorMessages() {
    if (this.signupForm.valid) {
      this.formErrors = {};
      return;
    }

    for (const controlName in this.signupForm.controls) {
      if (this.signupForm.get(controlName) ) {
        const control = this.signupForm.get(controlName);
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
