import { Component, OnInit, OnDestroy } from '@angular/core';

import { find, remove } from 'lodash';

import { Deferred } from '@root/vendor/deferred';

import { DataService } from '@shared/services/data/data.service';

import { FolderVO } from '@root/app/models';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';

@Component({
  selector: 'pr-folder-picker',
  templateUrl: './folder-picker.component.html',
  styleUrls: ['./folder-picker.component.scss']
})
export class FolderPickerComponent implements OnInit, OnDestroy {
  public currentFolder: FolderVO;
  public chooseFolderDeferred: Deferred;

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

  show(startingFolder: FolderVO) {
    this.visible = true;
    this.setFolder(startingFolder)
      .then(() => {
        this.loadCurrentFolderChildData();
      });

    this.chooseFolderDeferred = new Deferred();

    return this.chooseFolderDeferred.promise;
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
