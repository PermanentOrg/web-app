import { Component, OnInit, OnDestroy } from '@angular/core';

import { find, remove } from 'lodash';

import { Deferred } from '@root/vendor/deferred';

import { DataService } from '@shared/services/data/data.service';

import { FolderVO, ItemVO, RecordVO } from '@root/app/models/index';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';

export enum FolderPickerOperations {
  Move = 1,
  Copy,
  ChooseRecord
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

  public savePromise: Promise<any>;
  public visible: boolean;
  public waiting: boolean;
  public saving: boolean;
  public isRootFolder = true;
  public allowRecords = false;

  public selectedRecord: ItemVO;

  public filterFolderLinkIds: number[];

  constructor(
    private dataService: DataService,
    private api: ApiService,
    private folderPickerService: FolderPickerService
  ) {
    this.folderPickerService.registerComponent(this);
  }

  ngOnInit() {
  }

  show(
    startingFolder: FolderVO,
    operation: FolderPickerOperations,
    savePromise?: Promise<any>,
    filterFolderLinkIds: number[] = null,
    allowRecords = false
  ) {
    this.visible = true;
    this.operation = operation;
    this.allowRecords = allowRecords;

    this.savePromise = savePromise;

    this.filterFolderLinkIds = filterFolderLinkIds;

    switch (operation) {
      case FolderPickerOperations.Move:
        this.operationName = 'Move';
        break;
      case FolderPickerOperations.Copy:
        this.operationName = 'Copy';
        break;
      case FolderPickerOperations.ChooseRecord:
        this.operationName = 'Choose file';
        break;
    }

    this.setFolder(startingFolder)
      .then(() => {
        this.loadCurrentFolderChildData();
      });

    this.chooseFolderDeferred = new Deferred();

    return this.chooseFolderDeferred.promise;
  }

  onItemClick(item: ItemVO, evt: Event) {
    if (item instanceof FolderVO) {
      this.navigate(item);
    } else {
      this.showRecord(item);
    }

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }

  navigate(folder: FolderVO) {
    this.setFolder(folder);
  }

  showRecord(record: RecordVO) {
    this.selectedRecord =  record;
  }

  setFolder(folder: FolderVO) {
    this.waiting = true;
    return this.api.folder.navigate(new FolderVO({
      folder_linkId: folder.folder_linkId,
      folderId: folder.folderId,
      archiveNbr: folder.archiveNbr
    })).toPromise()
      .then((response: FolderResponse) => {
        this.waiting = false;
        this.currentFolder = response.getFolderVO(true);
        this.isRootFolder = this.currentFolder.type.includes('root');
        if (!this.allowRecords) {
          remove(this.currentFolder.ChildItemVOs, 'isRecord');
        }
        if (this.filterFolderLinkIds && this.filterFolderLinkIds.length) {
          remove(this.currentFolder.ChildItemVOs, (f: ItemVO) => this.filterFolderLinkIds.includes(f.folder_linkId));
        }
      });
  }

  onBackClick() {
    if (this.selectedRecord) {
      this.selectedRecord = null;
    } else {
      this.goToParentFolder();
    }
  }

  goToParentFolder() {
    const parentFolder = new FolderVO({
      folder_linkId: this.currentFolder.parentFolder_linkId,
      folderId: this.currentFolder.parentFolderId
    });
    return this.setFolder(parentFolder);
  }

  loadCurrentFolderChildData() {
    return this.dataService.fetchLeanItems(this.currentFolder.ChildItemVOs, this.currentFolder)
      .then(() => {
      });
  }

  chooseFolder() {
    if (this.selectedRecord) {
      this.chooseFolderDeferred.resolve(this.selectedRecord);
    } else if (this.currentFolder) {
      this.chooseFolderDeferred.resolve(this.currentFolder);
    }
    if (!this.savePromise) {
      this.hide();
    } else {
      this.saving = true;
      this.savePromise
        .then(() => {
          this.saving = false;
          this.hide();
        })
        .catch(() => {
          this.saving = false;
          this.hide();
        });
    }
  }

  hide() {
    this.visible = false;
    this.selectedRecord = null;

    setTimeout(() => {
      this.currentFolder = null;
      this.chooseFolderDeferred = null;
      this.isRootFolder = true;
    }, 1500);
  }

  ngOnDestroy() {
    this.folderPickerService.unregisterComponent();
  }
}
