import { Component, OnInit, OnDestroy } from '@angular/core';

import { find, remove } from 'lodash';

import { Deferred } from '@root/vendor/deferred';

import { DataService } from '@shared/services/data/data.service';

import { FolderVO } from '@root/app/models';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';

export enum FolderPickerOperations {
  Move = 1,
  Copy
}

@Component({
  selector: 'pr-folder-picker',
  templateUrl: './folder-picker.component.html',
  styleUrls: ['./folder-picker.component.scss']
})
export class FolderPickerComponent implements OnInit, OnDestroy {
  public currentFolder: FolderVO;
  public chooseFolderDeferred: Deferred;
  public operation: FolderPickerOperations;
  public operationName: string;

  public visible: boolean;
  public waiting: boolean;

  constructor(
    private dataService: DataService,
    private api: ApiService,
    private folderPickerService: FolderPickerService
  ) {
    this.folderPickerService.registerComponent(this);
  }

  ngOnInit() {
  }

  show(startingFolder: FolderVO, operation: FolderPickerOperations) {
    this.visible = true;
    this.operation = operation;

    switch (operation) {
      case FolderPickerOperations.Move:
        this.operationName = 'Move';
        break;
      case FolderPickerOperations.Copy:
        this.operationName = 'Copy';
        break;
    }

    this.setFolder(startingFolder)
      .then(() => {
        this.loadCurrentFolderChildData();
      });

    this.chooseFolderDeferred = new Deferred();

    return this.chooseFolderDeferred.promise;
  }

  navigate(folder: FolderVO, evt: Event) {
    this.setFolder(folder);
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }

  setFolder(folder: FolderVO) {
    this.waiting = true;
    return this.api.folder.navigate(folder).toPromise()
      .then((response: FolderResponse) => {
        this.waiting = false;
        this.currentFolder = response.getFolderVO(true);
        remove(this.currentFolder.ChildItemVOs, 'isRecord');
      });
  }

  loadCurrentFolderChildData() {
    return this.dataService.fetchLeanItems(this.currentFolder.ChildItemVOs, this.currentFolder)
      .then(() => {
      });
  }

  chooseFolder() {
    if (this.currentFolder) {
      this.chooseFolderDeferred.resolve(this.currentFolder);
    }
    this.hide();
  }

  hide() {
    this.visible = false;
    setTimeout(() => {
      this.currentFolder = null;
      this.chooseFolderDeferred = null;
    }, 1500);
  }

  ngOnDestroy() {
    this.folderPickerService.deregisterComponent();
  }
}
