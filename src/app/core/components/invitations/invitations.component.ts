import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { Deferred } from '@root/vendor/deferred';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';

import { InviteVO, InviteVOData } from '@models/index';

@Component({
  selector: 'pr-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent {
  constructor(
    private api: ApiService,
    private accountService: AccountService,
    private promptService: PromptService,
    private messageService: MessageService
  ) {
  }

  createNewInvitation() {
    const deferred = new Deferred();

    const fields: PromptField[] = [
      {
        fieldName: 'fullName',
        placeholder: 'Recipient Name',
        type: 'text',
        validators: [Validators.required],
        config: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off'
        }
      },
      {
        fieldName: 'email',
        placeholder: 'Recipient Email',
        type: 'email',
        validators: [Validators.required, Validators.email],
        config: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off'
        }
      }
    ];

    this.promptService.prompt(fields, 'Send invitation', deferred.promise)
      .then((value: InviteVOData) => {
        console.log(value);
        deferred.resolve();
      });
  }
}
