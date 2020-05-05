import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';
import { RelationVO, ArchiveVO, InviteVO, FolderVO, RecordVO, ItemVO } from '@models';
import { Deferred } from '@root/vendor/deferred';
import { ApiService } from '@shared/services/api/api.service';
import { SearchResponse, InviteResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { Validators } from '@angular/forms';
import { FormInputSelectOption } from '../form-input/form-input.component';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { INVITATION_FIELDS, ACCESS_ROLE_FIELD } from '@shared/components/prompt/prompt-fields';
import { AccountService } from '@shared/services/account/account.service';
import { clone } from 'lodash';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';

export interface ArchivePickerComponentConfig {
  relations?: RelationVO[];
  shareItem?: ItemVO;
  hideAccessRoleOnInvite?: boolean;
  hideRelations?: boolean;
}

@Component({
  selector: 'pr-archive-picker',
  templateUrl: './archive-picker.component.html',
  styleUrls: ['./archive-picker.component.scss']
})
export class ArchivePickerComponent implements OnInit {
  relations: RelationVO[];
  relationOptions: FormInputSelectOption[];
  hideAccessRoleOnInvite = false;
  searchResults: ArchiveVO[];
  searchEmail: string;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public dialogData: ArchivePickerComponentConfig,
    private prompt: PromptService,
    private api: ApiService,
    private accountService: AccountService,
    private message: MessageService,
    private prConstants: PrConstantsService,
    private ga: GoogleAnalyticsService
  ) {
    this.relations = this.dialogData.relations;
    this.hideAccessRoleOnInvite = this.dialogData.hideAccessRoleOnInvite;
    this.relationOptions = this.prConstants.getRelations().map((type) => {
      return {
        text: type.name,
        value: type.type
      };
    });
  }

  ngOnInit() {
  }

  searchByEmail() {
    const deferred = new Deferred();
    const fields: PromptField[] = [{
      fieldName: 'email',
      validators: [Validators.required, Validators.email],
      placeholder: 'Email',
      type: 'text',
      config: {
        autocapitalize: 'off',
        autocorrect: 'off',
        autocomplete: 'off',
        autoselect: false
      }
    }];

    this.searchResults = null;

    return this.prompt.prompt(fields, 'Search by email', deferred.promise, 'Search')
      .then((value) => {
        this.searchEmail = value.email;
        return this.api.search.archiveByEmail(value.email);
      })
      .then((response: SearchResponse) => {
        this.searchResults = response.getArchiveVOs();
        deferred.resolve();
      })
      .catch((response: SearchResponse) => {
        deferred.resolve();
      });
  }

  sendInvite() {
    const deferred = new Deferred();
    const fields: PromptField[] = clone(INVITATION_FIELDS(this.searchEmail));
    const forShare = !!this.dialogData.shareItem;

    if (!this.hideAccessRoleOnInvite) {
      fields.push(ACCESS_ROLE_FIELD);
    }

    return this.prompt.prompt(fields, forShare ? 'Invite to share' : 'Send invitation', deferred.promise, 'Send')
      .then((value) => {
        const invite = new InviteVO({
          email: value.email,
          fullName: value.name,
          byArchiveId: this.accountService.getArchive().archiveId,
          relationship: value.relationType,
          accessRole: value.accessRole
        });
        if (this.dialogData.shareItem) {
          return this.api.invite.sendShareInvite([invite], this.dialogData.shareItem);
        } else {
          return this.api.invite.send([invite]);
        }
      })
      .then((response: InviteResponse) => {
        this.message.showMessage('Invite sent succesfully.', 'success');
        if (forShare) {
          this.ga.sendEvent(EVENTS.SHARE.ShareByInvite.initiated.params);
        }
        deferred.resolve();
        this.cancel();
      })
      .catch((response: InviteResponse) => {
        if (response) {
          deferred.resolve();
          this.message.showError(response.getMessage(), true);
        }
      });
  }

  chooseArchive(archive: ArchiveVO) {
    this.dialogRef.close(archive);
  }

  cancel() {
    this.dialogRef.close(null, true);
  }

}
