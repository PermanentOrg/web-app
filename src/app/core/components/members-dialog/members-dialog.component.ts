import { Component, OnInit, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef, IsTabbedDialog } from '@root/app/dialog/dialog.module';
import { PromptButton, PromptField, ACCESS_ROLE_FIELD_INITIAL, PromptService } from '@shared/services/prompt/prompt.service';
import { AccountVO } from '@models';
import { Deferred } from '@root/vendor/deferred';
import { Validators } from '@angular/forms';
import { ArchiveResponse, InviteResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { AccessRoleType } from '@models/access-role';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { clone, remove } from 'lodash';

const MemberActions: {[key: string]: PromptButton} = {
  Edit: {
    buttonName: 'edit',
    buttonText: 'Edit'
  },
  Remove: {
    buttonName: 'remove',
    buttonText: 'Remove',
    class: 'btn-danger'
  }
};

type MembersTab = 'members' | 'pending' | 'add';

@Component({
  selector: 'pr-members-dialog',
  templateUrl: './members-dialog.component.html',
  styleUrls: ['./members-dialog.component.scss']
})
export class MembersDialogComponent implements OnInit, IsTabbedDialog {
  members: AccountVO[];
  canEdit: boolean;

  activeTab: MembersTab = 'members';

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    private promptService: PromptService,
    private message: MessageService,
    private api: ApiService,
    private accountService: AccountService
  ) {
    this.members = this.data.members;
  }

  ngOnInit(): void {
  }

  setTab(tab: MembersTab) {
    this.activeTab = tab;
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  onMemberClick(member: AccountVO) {
    const buttons = [];
    if (member.accessRole !== 'access.role.owner' ) {
      buttons.push(MemberActions.Edit);
    }
    buttons.push(MemberActions.Remove);
    this.promptService.promptButtons(buttons, `Member access for ${member.fullName}`)
      .then((value: string) => {
        switch (value) {
          case 'edit':
            this.editMember(member);
            break;
          case 'remove':
            this.removeMember(member);
            break;
        }
      });
  }

  async editMember(member: AccountVO) {
    const deferred = new Deferred();
    const fields = [ ACCESS_ROLE_FIELD_INITIAL(member.accessRole) ];
    const value: any = await this.promptService.prompt(fields, `Edit access for ${member.fullName}`, deferred.promise);
    const updatedMember = clone(member);
    updatedMember.accessRole = value.accessRole as AccessRoleType;
    try {
      if (updatedMember.accessRole === 'access.role.owner') {
        deferred.resolve();
        await this.confirmOwnershipTransfer();
        const response = await this.api.archive.transferOwnership(updatedMember, this.accountService.getArchive());
        this.message.showMessage('Ownership transfer request sent.', 'success');
        const account = response.getAccountVOs().pop();
        member.accessRole = updatedMember.accessRole;
        member.status = account.status;
      } else {
        const response = await this.api.archive.updateMember(updatedMember, this.accountService.getArchive());
        this.message.showMessage('Member access saved successfully.', 'success');
        member.accessRole = updatedMember.accessRole;
        deferred.resolve();
      }
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        this.message.showError(err.getMessage(), true);
      }
      deferred.resolve();
    }
  }

  removeMember(member: AccountVO) {
    const deferred = new Deferred();
    const confirmTitle = `Remove ${member.fullName}'s access to ${this.accountService.getArchive().fullName}?`;

    return this.promptService.confirm('Remove', confirmTitle, deferred.promise, 'btn-danger')
      .then(() => {
        return this.api.archive.removeMember(member, this.accountService.getArchive());
      })
      .then((response: ArchiveResponse) => {
        this.message.showMessage('Member removed successfully.', 'success');
        remove(this.members, member);
        deferred.resolve();
      })
      .catch((response: ArchiveResponse) => {
        deferred.resolve();
        if (response) {
          this.message.showError(response.getMessage(), true);
        }
      });
  }

  async onAddMemberClick() {
    const deferred = new Deferred();
    let member: AccountVO;
    const emailField: PromptField = {
      fieldName: 'primaryEmail',
      placeholder: 'Member email',
      type: 'email',
      validators: [ Validators.required, Validators.email ],
      config: {
        autocapitalize: 'off',
        autocorrect: 'off',
        autocomplete: 'off',
      }
    };
    const fields = [ emailField, ACCESS_ROLE_FIELD_INITIAL('access.role.viewer') ];

    const value = await this.promptService.prompt(fields, 'Add member', deferred.promise);
    member = value as AccountVO;

    try {
      let response: ArchiveResponse;
      if (member.accessRole === 'access.role.owner') {
        deferred.resolve();
        await this.confirmOwnershipTransfer();
        response = await this.api.archive.transferOwnership(member, this.accountService.getArchive());
        this.message.showMessage('Ownership transfer request sent.', 'success');
      } else {
        response = await this.api.archive.addMember(member, this.accountService.getArchive());
        this.message.showMessage('Member added successfully.', 'success');
        deferred.resolve();
      }
      const account = response.getAccountVOs().pop();
      account.accessRole = member.accessRole;
      this.members.push(account);
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        if (err.getMessage() === 'warning.archive.no_email_found') {
          this.promptForInvite(member);
        } else {
          this.message.showError(err.getMessage(), true);
        }
      }
      deferred.resolve();
    }
  }

  getTooltipForAccess(accessRole: AccessRoleType) {
    return 'members.' + accessRole.split('.').pop();
  }

  confirmOwnershipTransfer() {
    return this.promptService.confirm('Transfer ownership', 'Permanent Archives can only have one owner at a time. Once this is complete, your role will be changed to Curator');
  }

  promptForInvite(member: AccountVO) {
    const deferred = new Deferred();
    const title = `No account found for ${member.primaryEmail}. Send invitation?`;
    const fields: PromptField[] = [{
      fieldName: 'fullName',
      placeholder: 'Recipient name',
      validators: [ Validators.required ],
      type: 'text',
      config: {
        autocapitalize: 'on',
        autocorrect: 'off',
        autocomplete: 'off',
      }
    }];

    this.promptService.prompt(fields, title, deferred.promise, 'Invite')
      .then((value: any) => {
        member.fullName = value.fullName;
        return this.api.invite.sendMemberInvite(member, this.accountService.getArchive());
      })
      .then((response: InviteResponse) => {
        deferred.resolve();
        this.message.showMessage('Invite sent successfully.', 'success');
      })
      .catch((response: InviteResponse) => {
        deferred.resolve();
        if (response) {
          this.message.showError(response.getMessage(), true);
        }
      });
  }

}
