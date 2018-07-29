import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { AuthResponse, ArchiveResponse, AccountResponse } from '@shared/services/api/index.repo';

@Component({
  selector: 'pr-verify',
  templateUrl: './verify-embed.component.html',
  styleUrls: ['./verify-embed.component.scss']
})
export class VerifyEmbedComponent implements OnInit {
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
      .then(() => {
        return this.accountService.switchToDefaultArchive();
      })
      .then((response: ArchiveResponse) => {
        this.waiting = false;
        this.router.navigate(['/doneEmbed']);
      })
      .catch((response: ArchiveResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError(response.getMessage(), true);
      });
  }

}
