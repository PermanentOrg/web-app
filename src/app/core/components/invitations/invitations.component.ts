import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { Deferred } from '@root/vendor/deferred';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';

import { InviteVO, InviteVOData, FolderVO } from '@models/index';
import { InviteResponse } from '@shared/services/api/index.repo';
import { INVITATION_FIELDS } from '../prompt/prompt-fields';
import { DataService } from '@shared/services/data/data.service';

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
    private messageService: MessageService,
    private dataService: DataService
  ) {
    this.dataService.setCurrentFolder(new FolderVO({
      displayName: 'Invitations',
      pathAsText: ['Invitations'],
      type: 'page'
    }), true);
  }

  createNewInvitation() {
    let newInvite: InviteVO;
    const deferred = new Deferred();

    const fields: PromptField[] = INVITATION_FIELDS();

    this.promptService.prompt(fields, 'Send invitation', deferred.promise)
      .then((value: InviteVOData) => {
        value.relationship = 'relation.friend';
        newInvite = new InviteVO(value);
        return this.api.invite.send([newInvite]);
      })
      .then((response: InviteResponse) => {
        const message = `Invitation to ${newInvite.email} successfully sent`;
        this.messageService.showMessage(message, 'success');
        deferred.resolve();
      })
      .catch((response: InviteResponse) => {
        this.messageService.showError(response.getMessage(), true);
        deferred.reject();
      });
  }
}
