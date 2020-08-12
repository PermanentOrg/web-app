import { Component, OnInit, Inject } from '@angular/core';
import { IsTabbedDialog, DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { InviteVOData, InviteVO } from '@models';
import { InviteResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';

type InvitationsTab = 'new' | 'pending' | 'accepted';

@Component({
  selector: 'pr-invitations-dialog',
  templateUrl: './invitations-dialog.component.html',
  styleUrls: ['./invitations-dialog.component.scss']
})
export class InvitationsDialogComponent implements OnInit, IsTabbedDialog {
  newInviteForm: FormGroup;
  waiting = false;

  activeTab: InvitationsTab = 'new';
  constructor(
    private fb: FormBuilder,
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private api: ApiService,
    private messageService: MessageService
  ) {
    this.newInviteForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  setTab(tab: InvitationsTab) {
    this.activeTab = tab;
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  async onNewInviteFormSubmit(value: InviteVOData) {
    try {
      this.waiting = true;
      value.relationship = 'relation.friend';
      const newInvite = new InviteVO(value);
      await this.api.invite.send([newInvite]);
      const message = `Invitation to ${newInvite.email} successfully sent`;
      this.messageService.showMessage(message, 'success');
      this.newInviteForm.reset();
    } catch (err) {
      if (err instanceof InviteResponse) {
        this.messageService.showError(err.getMessage(), true);
      }
    } finally {
      this.waiting = false;
    }

  }

}
