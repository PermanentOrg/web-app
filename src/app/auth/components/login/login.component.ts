import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountService } from '../../../shared/services/account/account.service';
import { AuthResponse } from '../../../shared/services/api/auth.repo';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'pr-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  waiting: Boolean;

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private message: MessageService) {
    this.loginForm = fb.group({
      'email': ['', Validators.required],
      'password': ['', Validators.required]
    });
  }

  ngOnInit() {
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
