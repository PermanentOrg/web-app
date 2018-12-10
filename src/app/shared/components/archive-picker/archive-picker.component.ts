import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';
import { RelationVO, ArchiveVO } from '@models/index';
import { Deferred } from '@root/vendor/deferred';
import { ApiService } from '@shared/services/api/api.service';
import { SearchResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { Validators } from '@angular/forms';
import { FormInputSelectOption } from '../form-input/form-input.component';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { INVITATION_FIELDS } from '@core/components/prompt/prompt-fields';

export interface ArchivePickerComponentConfig {
  relations?: RelationVO[];
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
  searchResults: ArchiveVO[];
  searchEmail: string;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public dialogData: ArchivePickerComponentConfig,
    private prompt: PromptService,
    private api: ApiService,
    private message: MessageService,
    private prConstants: PrConstantsService
  ) {
    this.relations = this.dialogData.relations;
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
    const fields: PromptField[] = INVITATION_FIELDS(this.searchEmail);

    return this.prompt.prompt(fields, 'Send invitation', deferred.promise, 'Send')
      .then((value) => {
        deferred.resolve();
        console.log(value);
        this.cancel();
      });
  }

  chooseArchive(archive: ArchiveVO) {
    this.dialogRef.close(archive);
  }

  cancel() {
    this.dialogRef.close(null, true);
  }

}
