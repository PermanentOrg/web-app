import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse, ArchiveResponse, AccountResponse } from '@shared/services/api/index.repo';
import { Router } from '@angular/router';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-mfa',
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class MfaComponent implements OnInit {
  mfaForm: FormGroup;
  waiting: boolean;

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
      .then(() => {
        return this.accountService.switchToDefaultArchive();
      })
      .then((response: ArchiveResponse) => {
        this.waiting = false;
        this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}.`, 'success');
        this.router.navigate(['/']);
      })
      .catch((response: AuthResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError(response.getMessage(), true);
      });
  }

}
