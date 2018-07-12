import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AccountService } from '../../../shared/services/account/account.service';
import { AuthResponse } from '../../../shared/services/api/auth.repo';
import { Router } from '@angular/router';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'pr-mfa',
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.scss']
})
export class MfaComponent implements OnInit {
  mfaForm: FormGroup;
  waiting: Boolean;

  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private message: MessageService) {
    this.mfaForm = fb.group({
      'token': [],
    });
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.verifyMfa(formValue.token)
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
