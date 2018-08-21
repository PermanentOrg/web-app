import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { AccountResponse } from '@shared/services/api/index.repo';

const MIN_PASSWORD_LENGTH = 10;

@Component({
  selector: 'pr-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  waiting: boolean;
  formErrors = {
    name: false,
    invitation: false,
    email: false,
    password: false,
    confirm: false
  };

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private message: MessageService) {
    this.signupForm = fb.group({
      invitation: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      passwords: fb.group({
        password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
        confirm: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]]
      }, { validator: [Validators.required, this.matchValidator] }),
      agreed: ['', [Validators.required]],
      optIn: [true]
    });
  }

  ngOnInit() {
  }

  matchValidator(group: FormGroup) {
    const match = group.controls['password'].value === group.controls['confirm'].value;

    if (match && group.value.confirm) {
      group.controls['confirm'].setErrors(null);
      return null;
    }

    const errors = { mismatch: true };
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

}
