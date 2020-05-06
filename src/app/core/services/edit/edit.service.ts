import { Injectable, EventEmitter  } from '@angular/core';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { partition, remove, find } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderVO, RecordVO, ItemVO, FolderVOData, RecordVOData } from '@root/app/models';

import { FolderResponse, RecordResponse, ShareResponse } from '@shared/services/api/index.repo';
import { PromptButton, PromptService } from '../prompt/prompt.service';
import { Deferred } from '@root/vendor/deferred';
import { FolderPickerOperations } from '@core/components/folder-picker/folder-picker.component';
import { FolderPickerService } from '../folder-picker/folder-picker.service';
import { AccountService } from '@shared/services/account/account.service';
import { Dialog } from '@root/app/dialog/dialog.service';

export const ItemActions: {[key: string]: PromptButton} = {
  Rename: {
    buttonName: 'rename',
    buttonText: 'Rename',
  },
  Copy: {
    buttonName: 'copy',
    buttonText: 'Copy',
  },
  Move: {
    buttonName: 'move',
    buttonText: 'Move',
  },
  Download: {
    buttonName: 'download',
    buttonText: 'Download'
  },
  Delete: {
    buttonName: 'delete',
    buttonText: 'Delete',
    class: 'btn-danger'
  },
  Share: {
    buttonName: 'share',
    buttonText: 'Share'
  },
  Unshare: {
    buttonName: 'delete',
    buttonText: 'Remove',
    class: 'btn-danger'
  },
  Publish: {
    buttonName: 'publish',
    buttonText: 'Publish',
  },
  GetLink: {
    buttonName: 'publish',
    buttonText: 'Get link'
  },
  SetFolderView: {
    buttonName: 'setFolderView',
    buttonText: 'Set folder view'
  }
};

export type ActionType = 'delete' |
  'rename' |
  'share' |
  'publish' |
  'download' |
  'copy' |
  'move' |
  'setFolderView';

@Injectable()
export class EditService {

  constructor(
    private api: ApiService,
    private message: MessageService,
    private folderPicker: FolderPickerService,
    private dataService: DataService,
    private prompt: PromptService,
    private accountService: AccountService,
    private dialog: Dialog
  ) { }

  promptForAction(items: ItemVO[], actions: PromptButton[] = []) {
    const actionDeferred = new Deferred();

    let title;

    if (items.length > 1 ) {
      title = `${items.length} items selected`;
    } else {
      title = items[0].displayName;
    }

    if (actions.length) {
      this.prompt.promptButtons(actions, title, actionDeferred.promise)
      .then((value: ActionType) => {
        this.handleAction(items, value, actionDeferred);
      })
      .catch(err => {
      });
    } else {
      try {
        this.prompt.confirm('OK', title, null, null, `<p>No actions available</p>`);
      } catch (err) { }
    }
  }

  async handleAction(items: ItemVO[], value: ActionType, actionDeferred: Deferred) {
    try {
      switch (value) {
        case 'delete':
          await this.deleteItems(items);
          this.dataService.refreshCurrentFolder();
          actionDeferred.resolve();
          break;
        case 'move':
          actionDeferred.resolve();
          this.openFolderPicker(items, FolderPickerOperations.Move);
          break;
        case 'copy':
          actionDeferred.resolve();
          this.openFolderPicker(items, FolderPickerOperations.Copy);
          break;
        case 'download':
          actionDeferred.resolve();
          if (items.length === 1) {
            const item = items[0];
            if (item instanceof RecordVO) {
              this.dataService.downloadFile(item);
            }
          }
          break;
        case 'publish':
          actionDeferred.resolve();
          this.dialog.open('PublishComponent', { item: items[0] }, { height: 'auto' });
          break;
        case 'share':
          const response: ShareResponse = await this.api.share.getShareLink(items[0]);
          actionDeferred.resolve();
          this.dialog.open('SharingComponent', { item: items[0], link: response.getShareByUrlVO() });
          break;
        default:
          actionDeferred.resolve();
      }
    } catch (err) {
      if (err instanceof FolderResponse || err instanceof RecordResponse) {
        this.message.showError(err.getMessage(), true);
      }
      actionDeferred.resolve();
    }
  }

  createFolder(folderName: string, parentFolder: FolderVO): Promise<FolderVO | FolderResponse>   {
    const newFolder = new FolderVO({
      parentFolderId: parentFolder.folderId,
      parentFolder_linkId: parentFolder.folder_linkId,
      displayName: folderName
    });

    return this.api.folder.post([newFolder])
      .then((response: FolderResponse) => {
        return response.getFolderVO();
      });
  }

  async deleteItems(items: any[]): Promise<FolderResponse | RecordResponse | any>   {
    let folders: FolderVO[];
    let records: RecordVO[];

    items.forEach(i => i.isPendingAction = true);

    [ folders, records ] = partition(items, 'isFolder') as any[];

    const promises: Array<Promise<any>> = [];

    if (folders.length) {
      promises.push(
        this.api.folder.delete(folders)
      );
    } else {
      promises.push(Promise.resolve());
    }

    if (records.length) {
      promises.push(
        this.api.record.delete(records)
      );
    } else {
      promises.push(Promise.resolve());
    }

    try {
      const results = await Promise.all(promises);
      let folderResponse, recordResponse;
      [folderResponse, recordResponse] = results;
      this.dataService.hideItemsInCurrentFolder(items);
    } catch (err) {
      items.forEach(i => i.isPendingAction = false);
      throw err;
    }
  }

  updateItems(items: any[]): Promise<FolderResponse | RecordResponse | any>   {
    const folders: FolderVO[] = [];
    const records: RecordVO[] = [];

    const itemsByLinkId: {[key: number]: ItemVO} = {};

    const recordsByRecordId: Map<number, RecordVO> = new Map();

    items.forEach((item) => {
      item.isFolder ? folders.push(item) : records.push(item);
      itemsByLinkId[item.folder_linkId] = item;
      if (item instanceof RecordVO) {
        if (item.recordId) {
          recordsByRecordId.set(item.recordId, item);
        }
      }
    });

    const promises: Array<Promise<any>> = [];

    if (folders.length) {
      promises.push(
        this.api.folder.update(folders)
      );
    } else {
      promises.push(Promise.resolve());
    }

    if (records.length) {
      promises.push(
        this.api.record.update(records)
      );
    } else {
      promises.push(Promise.resolve());
    }

    return Promise.all(promises)
      .then((results) => {
        let folderResponse: FolderResponse;
        let recordResponse: RecordResponse;

        [folderResponse, recordResponse] = results;
        if (folderResponse) {
          folderResponse.getFolderVOs()
            .forEach((updatedItem) => {
              const newData: FolderVOData = {
                updatedDT: updatedItem.updatedDT
              };
              (itemsByLinkId[updatedItem.folder_linkId] as FolderVO).update(newData);
            });
        }

        if (recordResponse) {
          recordResponse.getRecordVOs()
          .forEach((updatedItem) => {
            const newData: RecordVOData = {
              updatedDT: updatedItem.updatedDT
            };
            const record = (itemsByLinkId[updatedItem.folder_linkId] as RecordVO) || recordsByRecordId.get(updatedItem.recordId);
            record.update(newData);
          });
        }
      });
  }

  moveItems(items: ItemVO[], destination: FolderVO): Promise<FolderResponse | RecordResponse | any>  {
    const folders: FolderVO[] = [];
    const records: RecordVO[] = [];

    const itemsByLinkId: {[key: number]: ItemVO} = {};

    items.forEach((item) => {
      item instanceof FolderVO ? folders.push(item) : records.push(item);
      itemsByLinkId[item.folder_linkId] = item;
      item.isPendingAction = true;
    });

    const promises: Array<Promise<any>> = [];

    if (folders.length) {
      promises.push(
        this.api.folder.move(folders, destination)
      );
    } else {
      promises.push(Promise.resolve());
    }

    if (records.length) {
      promises.push(
        this.api.record.move(records, destination)
      );
    } else {
      promises.push(Promise.resolve());
    }

    return Promise.all(promises)
      .then(results => {
        this.dataService.hideItemsInCurrentFolder(items);
        return results;
      })
      .catch(err => {
        items.forEach(item => item.isPendingAction = false);
        throw err;
      });
  }

  copyItems(items: any[], destination: FolderVO): Promise<FolderResponse | RecordResponse | any>  {
    const folders: FolderVO[] = [];
    const records: RecordVO[] = [];

    const itemsByLinkId: {[key: number]: ItemVO} = {};

    items.forEach((item) => {
      item.isFolder ? folders.push(item) : records.push(item);
      itemsByLinkId[item.folder_linkId] = item;
    });

    const promises: Array<Promise<any>> = [];

    if (folders.length) {
      promises.push(
        this.api.folder.copy(folders, destination)
      );
    } else {
      promises.push(Promise.resolve());
    }

    if (records.length) {
      promises.push(
        this.api.record.copy(records, destination)
      );
    } else {
      promises.push(Promise.resolve());
    }

    return Promise.all(promises);
  }

  async openShareDialog(item: ItemVO) {
    const response = await this.api.share.getShareLink(item);
    this.dialog.open('SharingComponent', { item, link: response.getShareByUrlVO() });
  }

  async openPublishDialog(item: ItemVO) {
    this.dialog.open('PublishComponent', { item }, { height: 'auto' });
  }

  openFolderPicker(items: ItemVO[], operation: FolderPickerOperations) {
    const deferred = new Deferred();
    const rootFolder = this.accountService.getRootFolder();
    const myFiles = new FolderVO(find(rootFolder.ChildItemVOs, {type: 'type.folder.root.private'}) as FolderVOData);

    const filterFolderLinkIds = [];

    for (const item of items) {
      if (item.isFolder) {
        filterFolderLinkIds.push(item.folder_linkId);
      }
    }

    this.folderPicker.chooseFolder(myFiles, operation, deferred.promise, filterFolderLinkIds)
      .then((destination: FolderVO) => {
        switch (operation) {
          case FolderPickerOperations.Copy:
            return this.copyItems(items, destination);
          case FolderPickerOperations.Move:
            return this.moveItems(items, destination);
        }
      })
      .then(() => {
        setTimeout(() => {
          deferred.resolve();
          const msg = `${items.length} item(s) ${operation === FolderPickerOperations.Copy ? 'copied' : 'moved'} successfully.`;
          this.message.showMessage(msg, 'success');
          if (operation === FolderPickerOperations.Move) {
            this.dataService.refreshCurrentFolder();
          }
        }, 500);
      })
      .catch((response: FolderResponse | RecordResponse) => {
        deferred.reject();
        this.message.showError(response.getMessage(), true);
      });
  }
}
