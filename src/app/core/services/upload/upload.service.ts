import { Injectable, EventEmitter, OnDestroy } from '@angular/core';

import { debounce, remove } from 'lodash';

import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderVO } from '@root/app/models';

import { Uploader, UploadSessionStatus } from './uploader';
import { UploadItem, UploadStatus } from './uploadItem';
import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { Subscription } from 'rxjs';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import debug from 'debug';
import { AccountService } from '@shared/services/account/account.service';
import { Deferred } from '@root/vendor/deferred';

const FILENAME_BLACKLIST = ['.DS_Store'];

interface FileWithPath {
  file: File;
  path?: string;
  parentFolder?: FolderVO;
}

interface FileSystemFolder {
  path?: string;
  parentFolder?: FolderVO;
  folder?: FolderVO;
}

@Injectable()
export class UploadService implements HasSubscriptions, OnDestroy {
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
    private accountService: AccountService,
    public uploader: Uploader,
  ) {
    this.debouncedRefresh = debounce(() => {
      this.dataService.refreshCurrentFolder();
    }, 750);

    this.subscriptions.push(this.uploader.progress.subscribe((progressEvent) => {
      if (progressEvent.item?.uploadStatus === UploadStatus.Done) {
        const parentFolderId = progressEvent.item.parentFolder.folderId;
        let currentCount = 0;
        if (this.itemsQueuedByParentFolderId.has(parentFolderId)) {
          currentCount = this.itemsQueuedByParentFolderId.get(parentFolderId) - 1;
        }

        this.itemsQueuedByParentFolderId.set(parentFolderId, currentCount);

        if (dataService.currentFolder && dataService.currentFolder.folderId === parentFolderId && currentCount === 0) {
          this.dataService.refreshCurrentFolder();
        }

        this.accountService.refreshAccountDebounced();
      }
    }));

    this.subscriptions.push(this.uploader.uploadSessionStatus.subscribe(status => {
      switch (status) {
        case UploadSessionStatus.Start:
          this.message.showMessage('Please don\'t close your browser until the upload is complete.');
          break;
        case UploadSessionStatus.Done:
          this.accountService.refreshAccountDebounced();
          break;
        case UploadSessionStatus.ConnectionError:
          this.message.showError('Unable to connect - try again in a moment');
          break;
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

  async uploadFolders(parentFolder: FolderVO, items: DataTransferItem[]) {
    this.debug('uploadFolders %d items to folder %o', items.length, parentFolder);

    const self = this;
    const foldersByPath: Map<string, FileSystemFolder> = new Map();
    const filesByPath: Map<string, FileWithPath[]> = new Map();

    foldersByPath.set('', { path: '', folder: parentFolder });

    const entries = items.map(i => i.webkitGetAsEntry());
    await getItemsFromItemList(entries);
    this.createFoldersAndUploadFiles(foldersByPath, filesByPath);

    async function getItemsFromItemList(dirEntries: any[]) {
      self.debug('uploadFolders getItemsFromItemList %d items in folder', entries.length);
      const filePromises: Promise<any>[] = [];
      for (const entry of dirEntries) {
        if (entry.isFile) {
          const deferred = new Deferred();
          filePromises.push(deferred.promise);
          entry.file(file => {
            if (FILENAME_BLACKLIST.includes((file as File).name)) {
              return deferred.resolve();
            }

            // store file with parent folder VO grouped by path
            const path = entry.fullPath;
            const pathParts = path.split('/');
            pathParts.pop();
            const parentPath = pathParts.join('/');
            const fileWithPath = {
              path: parentPath,
              file,
              parentFolder: foldersByPath.get(parentPath).folder
            };

            if (filesByPath.has(parentPath)) {
              filesByPath.get(parentPath).push(fileWithPath);
            } else {
              filesByPath.set(parentPath, [ fileWithPath ]);
            }

            deferred.resolve();
          });
        } else {
          const vo = new FolderVO({ displayName: entry.name });
          const path = entry.fullPath;
          const pathParts = path.split('/');
          pathParts.pop();
          const parentPath = pathParts.join('/');
          const folder: FileSystemFolder = {
            path,
            folder: vo,
            parentFolder: foldersByPath.get(parentPath).folder
          };
          foldersByPath.set(entry.fullPath, folder);
          const childEntries = await readDirectory(entry);
          await getItemsFromItemList(childEntries);
        }
      }

      await Promise.all(filePromises);
    }

    function readDirectory(directory): Promise<any[]> {
      const dirReader = directory.createReader();
      let e = [];

      const deferred = new Deferred();
      const getEntries = function() {
        dirReader.readEntries(function(results) {
          if (results.length) {
            e = e.concat(Array.from(results));
            getEntries();
          } else {
            deferred.resolve(e);
          }
        });
      };

      getEntries();

      return deferred.promise;
    }
  }

  async createFoldersAndUploadFiles(folders: Map<string, FileSystemFolder>, files: Map<string, FileWithPath[]>) {
    const pathsByDepth = new Map<Number, FileSystemFolder[]>();
    for (const [path, folder] of folders) {
      const depth = path.split('/').length - 1;
      if (pathsByDepth.has(depth)) {
        pathsByDepth.get(depth).push(folder);
      } else {
        pathsByDepth.set(depth, [ folder ]);
      }
    }

    // group folder creation at each depth
    for (const [depth, foldersAtDepth] of pathsByDepth) {
      // create folders if needed
      const needIds = foldersAtDepth.filter(f => !f.folder.folderId);

      let needsRefresh = false;
      if (needIds.length && depth > 0) {
        for (const f of needIds) {
          f.folder.parentFolderId = f.parentFolder.folderId;
          f.folder.parentFolder_linkId = f.parentFolder.folder_linkId;

          if (f.parentFolder.folderId === this.dataService.currentFolder.folderId) {
            needsRefresh = true;
          }
        }

        const response = await this.api.folder.post(needIds.map(f => f.folder));
        const updatedFolders = response.getFolderVOs();

        needIds.forEach((f, i) => {
          f.folder.update(updatedFolders[i]);
        });
      }

      if (needsRefresh) {
        this.dataService.refreshCurrentFolder();
      }

      // queue uploads for each folder
      for (const f of foldersAtDepth) {
        if (files.has(f.path)) {
          const filesForFolder = files.get(f.path);
          this.uploadFiles(f.folder, filesForFolder.map(i => i.file));
        }
      }
    }

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
