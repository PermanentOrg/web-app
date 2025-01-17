import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
} from '@angular/core';

import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { InviteVOData, InviteVO } from '@models';
import { InviteResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { partition, filter } from 'lodash';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

type InvitationsTab = 'new' | 'pending' | 'accepted';

@Component({
  selector: 'pr-invitations-dialog',
  templateUrl: './invitations-dialog.component.html',
  styleUrls: ['./invitations-dialog.component.scss'],
})
export class InvitationsDialogComponent implements OnInit {
  newInviteForm: UntypedFormGroup;
  waiting = false;

  pendingInvites: InviteVO[];
  acceptedInvites: InviteVO[];

  activeTab: InvitationsTab = 'new';
  @ViewChild('panel') panelElem: ElementRef;

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private api: ApiService,
    private messageService: MessageService,
  ) {
    this.newInviteForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadInvites();
  }

  async loadInvites() {
    try {
      const response = await this.api.invite.getInvites();
      const allInvites = response.getInviteVOs();
      this.acceptedInvites = filter(allInvites, {
        status: 'status.invite.accepted',
      });
      this.pendingInvites = filter(allInvites, {
        status: 'status.invite.pending',
      });
    } catch (err) {
      if (err instanceof InviteResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
    }
  }

  setTab(tab: InvitationsTab) {
    this.activeTab = tab;
    this.panelElem.nativeElement.scrollTop = 0;
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
      this.messageService.showMessage({ message, style: 'success' });
      this.newInviteForm.reset();
    } catch (err) {
      if (err instanceof InviteResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
    } finally {
      this.waiting = false;
    }
  }

  async resendInvite(invite: InviteVO) {
    try {
      this.waiting = true;
      const response = await this.api.invite.resendInvites([invite]);
      const updated = response.getInviteVO();
      invite.updatedDT = updated.updatedDT;
      this.messageService.showMessage({
        message: 'Invitation re-sent.',
        style: 'success',
      });
    } catch (err) {
      if (err instanceof InviteResponse) {
        this.messageService.showError({
          message: err.getMessage(),
          translate: true,
        });
      }
    } finally {
      this.waiting = false;
    }
  }
}
