import { Component, OnInit, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';
import { RelationVO, ArchiveVO } from '@models/index';
import { Deferred } from '@root/vendor/deferred';
import { ApiService } from '@shared/services/api/api.service';
import { SearchResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';

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
  searchResults: ArchiveVO[];
  searchEmail: string;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public dialogData: ArchivePickerComponentConfig,
    private prompt: PromptService,
    private api: ApiService,
    private message: MessageService
  ) {
    this.relations = this.dialogData.relations;
  }

  ngOnInit() {
  }

  searchByEmail() {
    const deferred = new Deferred();
    const fields: PromptField[] = [{
      fieldName: 'email',
      placeholder: 'Email to search',
      type: ' text',
      config: {
        autocapitalize: 'off',
        autocorrect: 'off',
        autocomplete: 'off'
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

  chooseArchive(archive: ArchiveVO) {
    this.dialogRef.close(archive);
  }

  cancel() {
    this.dialogRef.close(null, true);
  }

}
