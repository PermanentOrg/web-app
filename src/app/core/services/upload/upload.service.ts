import { Injectable, EventEmitter, OnDestroy } from '@angular/core';

import { debounce, remove } from 'lodash';

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
import debug from 'debug';
import { AccountService } from '@shared/services/account/account.service';

@Injectable()
export class UploadService implements HasSubscriptions, OnDestroy {
  public uploader: Uploader = new Uploader(this.api, this.message);
  public component: UploadProgressComponent;
  public buttonComponents: UploadButtonComponent[] = [];
  public progressVisible: EventEmitter<boolean> = new EventEmitter();

  private debouncedRefresh: Function;

  private itemsQueuedByParentFolderId = new Map<number, number>();

  subscriptions: Subscription[] = [];

  private debug = debug('service:upload');

  constructor(
    private api: ApiService,
    private message: MessageService,
    private dataService: DataService,
    private accountService: AccountService
  ) {
    this.debouncedRefresh = debounce(() => {
      this.dataService.refreshCurrentFolder();
    }, 750);

    this.subscriptions.push(this.uploader.fileUploadComplete.subscribe((item: UploadItem) => {
      const parentFolderId = item.parentFolder.folderId;
      let currentCount = 0;
      if (this.itemsQueuedByParentFolderId.has(parentFolderId)) {
        currentCount = this.itemsQueuedByParentFolderId.get(parentFolderId) - 1;
      }

      this.itemsQueuedByParentFolderId.set(parentFolderId, currentCount);

      if (dataService.currentFolder && dataService.currentFolder.folderId === parentFolderId && currentCount === 0) {
        this.dataService.refreshCurrentFolder();
      }

      this.accountService.refreshAccountDebounced();
    }));

    this.subscriptions.push(this.uploader.uploadSessionStatus.subscribe(status => {
      if (status === UploadSessionStatus.Done) {
        this.accountService.refreshAccountDebounced();
      }
    }));
  }

  ngOnDestroy() {
    unsubscribeAll(this.subscriptions);
    this.uploader.closeSocketConnection();
  }

  registerButtonComponent(component: UploadButtonComponent) {
    this.buttonComponents.push(component);
  }

  unregisterButtonComponent(component: UploadButtonComponent) {
    remove(this.buttonComponents, component);
  }

  registerComponent(component: UploadProgressComponent) {
    this.component = component;
  }

  promptForFiles() {
    if (this.buttonComponents.length) {
      this.buttonComponents[0].promptForFiles();
    }
  }

  uploadFiles(parentFolder: FolderVO, files: File[]) {
    this.debug('uploadFiles %d files to folder %o', files.length, parentFolder);
    let currentCount = 0;
    if (this.itemsQueuedByParentFolderId.has(parentFolder.folderId)) {
      currentCount = this.itemsQueuedByParentFolderId.get(parentFolder.folderId);
    }

    this.itemsQueuedByParentFolderId.set(parentFolder.folderId, currentCount + files.length);

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

    this.accountService.refreshAccountDebounced();
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
