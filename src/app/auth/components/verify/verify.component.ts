import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { AuthResponse, ArchiveResponse, AccountResponse } from '@shared/services/api/index.repo';
import { AccountVO } from '@root/app/models';

@Component({
  selector: 'pr-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  host: {'class': 'pr-auth-form'}
})
export class VerifyComponent implements OnInit {
  verifyForm: FormGroup;
  waiting: boolean;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private message: MessageService,
    private route: ActivatedRoute
  ) {

    const params = route.snapshot.params;
    if (params.email) {
      this.accountService.setAccount(new AccountVO({primaryEmail: window.atob(params.email)}));
    }

    this.verifyForm = fb.group({
      'token': [params.code || ''],
    });
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.verifyEmail(formValue.token)
      .then(() => {
        return this.accountService.switchToDefaultArchive();
      })
      .then((response: ArchiveResponse) => {
        this.waiting = false;
        this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}`, 'success');
        this.router.navigate(['/']);
      })
      .catch((response: ArchiveResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError(response.getMessage(), true);
      });
  }

}
