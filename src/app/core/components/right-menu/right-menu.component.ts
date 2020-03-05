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
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { AccountService } from '@shared/services/account/account.service';
import { checkMinimumAccess, AccessRole } from '@models/access-role';

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
    createFolder: false,
    useGridView: false,
    useListView: false
  };
  public hasAllowedActions = false;

  public folderViews = FolderView;

  constructor(
    private message: MessageService,
    private edit: EditService,
    private dataService: DataService,
    private account: AccountService,
    private prompt: PromptService,
    private folderViewService: FolderViewService
  ) {
    this.dataService.currentFolderChange.subscribe((currentFolder: FolderVO) => {
      this.currentFolder = currentFolder;
      this.setAvailableActions();
    });

    this.folderViewService.viewChange.subscribe((folderView: FolderView) => {
      this.setAvailableActions();
    });
  }

  ngOnInit() {
    this.currentFolder = this.dataService.currentFolder;
    this.setAvailableActions();
  }

  setAvailableActions() {
    this.allowedActions.createFolder = this.currentFolder
      && !(this.currentFolder.type.includes('app') || this.currentFolder.type.includes('root.share'))
      && checkMinimumAccess(this.currentFolder.accessRole, AccessRole.Contributor)
      && checkMinimumAccess(this.account.getArchive().accessRole, AccessRole.Contributor);

    this.allowedActions.useGridView = !!this.currentFolder
      && this.folderViewService.folderView !== FolderView.Grid
      && !(this.currentFolder.type.includes('app') || this.currentFolder.type.includes('root.share'));

    this.allowedActions.useListView = !!this.currentFolder
      && this.folderViewService.folderView !== FolderView.List
      && !(this.currentFolder.type.includes('app') || this.currentFolder.type.includes('root.share'));

    this.hasAllowedActions = this.allowedActions.createFolder || this.allowedActions.useGridView || this.allowedActions.useListView;
  }

  hide(event: Event) {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
    event.stopPropagation();
    return false;
  }

  setFolderView(folderView: FolderView) {
    this.folderViewService.setFolderView(folderView);
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
            if (response) {
              this.message.showError(response.getMessage(), true);
              createReject();
            }
          });
      });
  }
}
