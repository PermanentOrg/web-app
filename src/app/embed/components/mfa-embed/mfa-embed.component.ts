import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { AuthResponse, ArchiveResponse, AccountResponse } from '@shared/services/api/index.repo';
import { IFrameService } from '@shared/services/iframe/iframe.service';

@Component({
  selector: 'pr-mfa',
  templateUrl: './mfa-embed.component.html',
  styleUrls: ['./mfa-embed.component.scss']
})
export class MfaEmbedComponent implements OnInit {
  verifyForm: UntypedFormGroup;
  waiting: boolean;

  constructor(
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private router: Router,
    private message: MessageService,
    private iFrame: IFrameService
  ) {
    this.verifyForm = fb.group({
      'token': ['', Validators.required],
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
        this.iFrame.setParentUrl('/app');
      })
      .catch((response: AuthResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError(response.getMessage(), true);
      });
  }

}
