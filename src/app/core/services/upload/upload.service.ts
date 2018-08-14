import { Injectable, EventEmitter } from '@angular/core';

import { debounce } from 'lodash';

import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderVO } from '@root/app/models';

import { Uploader, UploadSessionStatus } from './uploader';
import { UploadItem } from '@core/services/upload/uploadItem';
import { RecordResponse } from '@shared/services/api/index.repo';


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  public uploader: Uploader = new Uploader(this.api, this.message);
  public component: UploadProgressComponent;
  public progressVisible: EventEmitter<boolean> = new EventEmitter();

  private debouncedRefresh: Function;

  constructor(private api: ApiService, private message: MessageService, private dataService: DataService) {
    this.debouncedRefresh = debounce(() => {
      this.dataService.refreshCurrentFolder();
    }, 750);

    this.uploader.fileUploadComplete.subscribe((item: UploadItem) => {
      const parentFolderId = item.parentFolder.folderId;
      if (dataService.currentFolder && dataService.currentFolder.folderId === parentFolderId) {
        this.debouncedRefresh();
      }
    });
  }

  registerComponent(component: UploadProgressComponent) {
    this.component = component;
  }

  uploadFiles(parentFolder: FolderVO, files: File[]) {
    return this.uploader.connectAndUpload(parentFolder, files)
      .catch((response: any) => {
        this.handleUploaderError(response);
      });
  }

  retryFiles() {
    return this.uploader.retryFiles()
      .catch((response: any) => {
        this.handleUploaderError(response);
      });
  }

  handleUploaderError(response: any) {
    if (response && typeof response.getMessage === 'function') {
      if (response.messageIncludesPhrase('no_space_left')) {
        this.message.showError('You do not have enough storage available to upload these files.');
      }
    }
  }

  showProgress() {
    if (this.component) {
      this.component.show();
    }
    this.progressVisible.emit(true);
  }

  dismissProgress() {
    if (this.component) {
      this.component.dismiss();
    }
    this.progressVisible.emit(false);
  }
}
