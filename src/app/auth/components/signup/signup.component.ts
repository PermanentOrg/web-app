import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountService } from '../../../shared/services/account/account.service';
import { AuthResponse } from '../../../shared/services/api/auth.repo';
import { MessageService } from '../../../shared/services/message/message.service';

const MIN_PASSWORD_LENGTH = 10;

@Component({
  selector: 'pr-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  waiting: Boolean;

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private message: MessageService) {
    this.signupForm = fb.group({
      'email': ['', [Validators.required, Validators.email]],
      'name': ['', Validators.required],
      'passwords': fb.group({
        'password': ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
        'confirm': ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]]
      }, { validator: this.matchValidator })
    });
  }

  ngOnInit() {
  }

  matchValidator(group: FormGroup) {
    const match = group.controls['password'].value === group.controls['confirm'].value;

    if (match) {
      group.controls['confirm'].setErrors(null);
      return null;
    }

    const errors = { mismatch: true };

    group.controls['confirm'].setErrors(errors);

    return errors;
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.logIn(formValue.email, formValue.password, true, true)
      .then((response: AuthResponse) => {
        this.waiting = false;

        if (response.needsMFA()) {
          this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}`, 'warning');
          this.router.navigate(['/mfa']);
        } else {
          this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}`, 'success');
          this.router.navigate(['/app']);
        }
      })
      .catch((response: AuthResponse) => {
        if (response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage('Incorrect email or password', 'danger');
        } else {
          this.message.showMessage('Log in failed. Please try again.', 'danger');
        }
        this.waiting = false;
      });
  }

}
