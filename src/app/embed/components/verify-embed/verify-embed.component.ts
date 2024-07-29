import { Component } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import {
  ArchiveResponse,
  AccountResponse,
} from '@shared/services/api/index.repo';

@Component({
  selector: 'pr-verify',
  templateUrl: './verify-embed.component.html',
  styleUrls: ['./verify-embed.component.scss'],
})
export class VerifyEmbedComponent {
  verifyForm: UntypedFormGroup;
  waiting: boolean;

  constructor(
    fb: UntypedFormBuilder,
    private accountService: AccountService,
    private router: Router,
    private message: MessageService,
    private route: ActivatedRoute,
  ) {
    this.verifyForm = fb.group({
      token: ['', Validators.required],
    });
  }

  onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService
      .verifyEmail(formValue.token)
      .then(() => {
        return this.accountService.switchToDefaultArchive();
      })
      .then((_: ArchiveResponse) => {
        this.waiting = false;
        this.router.navigate(['..', 'done'], { relativeTo: this.route });
      })
      .catch((response: ArchiveResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError({
          message: response.getMessage(),
          translate: true,
        });
      });
  }
}
