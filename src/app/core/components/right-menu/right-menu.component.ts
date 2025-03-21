import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import {
  PromptService,
  PromptField,
} from '@shared/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderResponse } from '@shared/services/api/index.repo';
import { FolderVO } from '@root/app/models';
import { Validators, FormBuilder } from '@angular/forms';
import { EditService, ItemActions } from '@core/services/edit/edit.service';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { AccountService } from '@shared/services/account/account.service';
import { checkMinimumAccess, AccessRole } from '@models/access-role';
import { Subscription } from 'rxjs';
import { BaseResponse } from '@shared/services/api/base';

@Component({
  selector: 'pr-right-menu',
  templateUrl: './right-menu.component.html',
  styleUrls: ['./right-menu.component.scss'],
})
export class RightMenuComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() isVisibleChange: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  isMultiSelectEnabled = false;
  isMultiSelectEnabledSubscription: Subscription;

  public accountName: string;

  public currentFolder: FolderVO;
  public allowedActions = {
    createFolder: false,
    folderActions: false,
    multiSelect: false,
    useGridView: false,
    useListView: false,
  };
  public hasAllowedActions = false;

  public folderViews = FolderView;

  constructor(
    private message: MessageService,
    private edit: EditService,
    private dataService: DataService,
    private account: AccountService,
    private prompt: PromptService,
    private folderViewService: FolderViewService,
  ) {
    this.dataService.currentFolderChange.subscribe(
      (currentFolder: FolderVO) => {
        this.currentFolder = currentFolder;
        this.setAvailableActions();
      },
    );

    this.folderViewService.viewChange.subscribe((folderView: FolderView) => {
      this.setAvailableActions();
    });

    this.isMultiSelectEnabledSubscription =
      this.dataService.multiSelectChange.subscribe((isEnabled) => {
        this.isMultiSelectEnabled = isEnabled;
      });
  }

  ngOnInit() {
    this.currentFolder = this.dataService.currentFolder;
    this.setAvailableActions();
  }

  setAvailableActions() {
    if (!this.currentFolder) {
      this.allowedActions.createFolder = false;
      this.allowedActions.multiSelect = false;
      this.allowedActions.folderActions = false;
      this.allowedActions.useGridView = false;
      this.allowedActions.useListView = false;
      this.hasAllowedActions = false;
      return false;
    }

    const isSpecialFolder =
      this.currentFolder.type.includes('app') ||
      this.currentFolder.type.includes('root.share');

    this.allowedActions.createFolder =
      this.currentFolder &&
      !isSpecialFolder &&
      checkMinimumAccess(
        this.currentFolder.accessRole,
        AccessRole.Contributor,
      ) &&
      checkMinimumAccess(
        this.account.getArchive().accessRole,
        AccessRole.Contributor,
      );
    this.allowedActions.multiSelect = this.allowedActions.createFolder;
    this.allowedActions.folderActions =
      this.allowedActions.createFolder &&
      !this.currentFolder.type.includes('root');

    this.allowedActions.useGridView =
      !!this.currentFolder &&
      this.folderViewService.folderView !== FolderView.Grid &&
      !isSpecialFolder;

    this.allowedActions.useListView =
      !!this.currentFolder &&
      this.folderViewService.folderView !== FolderView.List &&
      !isSpecialFolder;

    this.hasAllowedActions =
      this.allowedActions.createFolder ||
      this.allowedActions.useGridView ||
      this.allowedActions.useListView;
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

  startMultiSelect() {
    this.dataService.setMultiSelect(true);
  }

  endMultiSelect() {
    this.dataService.setMultiSelect(false);
  }

  createNewFolder() {
    let createResolve, createReject;

    const fields: PromptField[] = [
      {
        fieldName: 'folderName',
        placeholder: 'Folder Name',
        config: {
          autocapitalize: 'off',
          autocorrect: 'off',
          autocomplete: 'off',
          spellcheck: 'off',
        },
        validators: [Validators.required],
      },
    ];

    const createPromise = new Promise((resolve, reject) => {
      createResolve = resolve;
      createReject = reject;
    });

    return this.prompt
      .prompt(fields, 'Create new folder', createPromise, 'Create folder')
      .then((value: any) => {
        this.edit
          .createFolder(value.folderName, this.currentFolder)
          .then(async (folder: FolderVO) => {
            this.message.showMessage({
              message: `Folder "${value.folderName}" has been created`,
              style: 'success',
            });
            await this.dataService.refreshCurrentFolder();
            createResolve();
            this.dataService.showItem(folder);
          })
          .catch((err) => {
            if (err instanceof BaseResponse) {
              this.message.showError({
                message: err.getMessage(),
                translate: true,
              });
              createReject();
            } else {
              throw err;
            }
          });
      });
  }

  showFolderActions() {
    const isPublic = this.dataService.currentFolder.type.includes('public');

    const actions = [];

    if (
      !isPublic &&
      this.account.checkMinimumAccess(
        this.dataService.currentFolder.accessRole,
        AccessRole.Owner,
      )
    ) {
      actions.push(ItemActions.Share);
      actions.push(ItemActions.Publish);
    } else if (isPublic) {
      actions.push(ItemActions.GetLink);
    }

    this.edit.promptForAction([this.dataService.currentFolder], actions);
  }
}
