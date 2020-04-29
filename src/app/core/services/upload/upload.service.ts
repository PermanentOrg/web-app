import { Injectable, EventEmitter, OnDestroy } from '@angular/core';

import { debounce } from 'lodash';

import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderVO } from '@root/app/models';

import { Uploader, UploadSessionStatus } from './uploader';
import { UploadItem } from '@core/services/upload/uploadItem';
import { RecordResponse } from '@shared/services/api/index.repo';
import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { Subscription } from 'rxjs';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';


@Injectable()
export class UploadService implements HasSubscriptions, OnDestroy {
  public uploader: Uploader = new Uploader(this.api, this.message);
  public component: UploadProgressComponent;
  public buttonComponent: UploadButtonComponent;
  public progressVisible: EventEmitter<boolean> = new EventEmitter();

  private debouncedRefresh: Function;

  subscriptions: Subscription[] = [];

  constructor(private api: ApiService, private message: MessageService, private dataService: DataService) {
    this.debouncedRefresh = debounce(() => {
      this.dataService.refreshCurrentFolder();
    }, 750);

    this.subscriptions.push(this.uploader.fileUploadComplete.subscribe((item: UploadItem) => {
      const parentFolderId = item.parentFolder.folderId;
      if (dataService.currentFolder && dataService.currentFolder.folderId === parentFolderId) {
        this.debouncedRefresh();
      }
    }));

    this.subscriptions.push(this.uploader.uploadSessionStatus.subscribe(status => {
      if (status === UploadSessionStatus.Done) {
        this.debouncedRefresh();
      }
    }));
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
    this.uploader.closeSocketConnection();
  }

  registerButtonComponent(component: UploadButtonComponent) {
    this.buttonComponent = component;
  }

  deregisterButtonComponent() {
    this.buttonComponent = null;
  }

  registerComponent(component: UploadProgressComponent) {
    this.component = component;
  }

  promptForFiles() {
    if (this.buttonComponent) {
      this.buttonComponent.promptForFiles();
    }
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

  async cleanUpFiles() {
    try {
      await this.uploader.cleanUpFiles();
    } catch (err) {
      this.handleUploaderError(err);
    }
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
