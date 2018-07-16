import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountService } from '../../../shared/services/account/account.service';
import { MessageService } from '../../../shared/services/message/message.service';
import { AuthResponse } from '../../../shared/services/api/auth.repo';

@Component({
  selector: 'pr-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class VerifyComponent implements OnInit {
  verifyForm: FormGroup;
  waiting: boolean;

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private message: MessageService) {
    this.verifyForm = fb.group({
      'token': [],
    });
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.verifyEmail(formValue.token)
      .then((response: AuthResponse) => {
        this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}`, 'success');
        this.router.navigate(['/app']);
      })
      .catch((response: AuthResponse) => {
        console.error(response);
        this.waiting = false;
      });
  }

}
