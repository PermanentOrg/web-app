import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';

import { FolderResponse} from '@shared/services/api/index.repo';
import { FolderVO } from '@root/app/models';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'pr-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss']
})
export class RightMenuComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public accountName: string;

  public currentFolder: FolderVO;

  constructor(
    private router: Router,
    private dataService: DataService,
    private api: ApiService,
    private fb: FormBuilder,
    private prompt: PromptService
  ) {
    this.dataService.currentFolderChange.subscribe((currentFolder: FolderVO) => {
      this.currentFolder = currentFolder;
    });
  }

  ngOnInit() {
  }

  hide(event: Event) {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
    event.stopPropagation();
    return false;
  }

  createNewFolder() {
    const fields: PromptField[] = [{
      fieldName: 'folderName',
      placeholder: 'Folder Name',
      config: {
        autocapitalize: 'off',
        autocorrect: 'off',
        autocomplete: 'off',
        spellcheck: 'off'
      },
      validators: [Validators.required]
    }];


    return this.prompt.prompt(fields, 'Create Folder')
      .then((value) => {
        const newFolder = new FolderVO({
          parentFolderId: this.currentFolder.folderId,
          parentFolder_linkId: this.currentFolder.folder_linkId,
          displayName: value.folderName
        });
        return this.api.folder.post([newFolder])
          .pipe(map(((response: FolderResponse) => {
            if (!response.isSuccessful) {
              throw response;
            }

            return response.getFolderVO(true);
          }))).toPromise()
          .then((folder: FolderVO) => {
            return this.dataService.refreshCurrentFolder();
          })
          .catch((error) => {
            console.error(error);
          });
      });
  }

}
