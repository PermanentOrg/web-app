import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderResponse} from '@shared/services/api/index.repo';
import { FolderVO } from '@root/app/models';
import { Validators, FormBuilder } from '@angular/forms';
import { EditService } from '@core/services/edit/edit.service';

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
  public allowedActions = {
    createFolder: false
  };

  constructor(
    private router: Router,
    private message: MessageService,
    private edit: EditService,
    private dataService: DataService,
    private api: ApiService,
    private fb: FormBuilder,
    private prompt: PromptService,
  ) {
    this.dataService.currentFolderChange.subscribe((currentFolder: FolderVO) => {
      this.currentFolder = currentFolder;
      this.setAvailableActions();
    });
  }

  ngOnInit() {
    this.currentFolder = this.dataService.currentFolder;
    this.setAvailableActions();
  }

  setAvailableActions() {
    this.allowedActions.createFolder = this.currentFolder && !this.currentFolder.type.includes('app');
  }

  hide(event: Event) {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
    event.stopPropagation();
    return false;
  }

  createNewFolder() {
    let createResolve, createReject;

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

    const createPromise = new Promise((resolve, reject) => {
      createResolve = resolve;
      createReject = reject;
    });

    return this.prompt.prompt(fields, 'Create New Folder', createPromise, 'Create Folder')
      .then((value) => {
        this.edit.createFolder(value.folderName, this.currentFolder)
          .then((folder: FolderVO) => {
            this.message.showMessage(`Folder "${value.folderName}" has been created`, 'success');
            createResolve();
            return this.dataService.refreshCurrentFolder();
          })
          .catch((response: FolderResponse) => {
            this.message.showError(response.getMessage(), true);
            createReject();
          });
      });
  }
}
