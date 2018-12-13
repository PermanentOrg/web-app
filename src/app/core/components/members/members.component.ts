import { Component, OnInit } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, AccountVO } from '@models/index';
import { ActivatedRoute } from '@angular/router';
import { PromptService, PromptButton } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { ACCESS_ROLE_FIELD, ACCESS_ROLE_FIELD_INITIAL } from '../prompt/prompt-fields';
import { Deferred } from '@root/vendor/deferred';
import { clone } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveResponse } from '@shared/services/api/index.repo';

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

@Component({
  selector: 'pr-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  members: AccountVO[];

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private promptService: PromptService,
    private message: MessageService,
    private api: ApiService,
    private accountService: AccountService
  ) {
    this.dataService.setCurrentFolder(new FolderVO({
      displayName: 'Members',
      pathAsText: ['Members'],
      type: 'page'
    }), true);

    this.members = route.snapshot.data.members;
  }

  ngOnInit() {
  }

  onMemberClick(member: AccountVO) {
    const buttons = [ MemberActions.Edit, MemberActions.Remove ];
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

  editMember(member: AccountVO) {
    const deferred = new Deferred();
    const fields = [ ACCESS_ROLE_FIELD_INITIAL(member.accessRole) ];
    return this.promptService.prompt(fields, `Edit access for ${member.fullName}`, deferred.promise)
      .then((value: {accessRole: string}) => {
        const updatedMember = clone(member);
        updatedMember.accessRole = value.accessRole;
        return this.api.archive.updateMember(updatedMember, this.accountService.getArchive());
      })
      .then((response: ArchiveResponse) => {
        this.message.showMessage('Member access saved successfully.', 'success');
        member.accessRole = response.getAccountVOs().pop().accessRole;
        deferred.resolve();
      })
      .catch((response: ArchiveResponse) => {
        deferred.resolve();
        if (response) {
          this.message.showError(response.getMessage(), true);
        }
      });
  }

  removeMember(member: AccountVO) {

  }
}
