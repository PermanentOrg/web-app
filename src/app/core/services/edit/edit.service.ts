import { Injectable, EventEmitter } from '@angular/core';
import { partition, remove, find } from 'lodash';
import { Subject } from 'rxjs';
import { environment } from '@root/environments/environment';
import debug from 'debug';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import {
  FolderVO,
  RecordVO,
  ItemVO,
  FolderVOData,
  RecordVOData,
  ShareVO,
} from '@root/app/models';

import {
  FolderResponse,
  RecordResponse,
  ShareResponse,
} from '@shared/services/api/index.repo';
import {
  PromptButton,
  PromptService,
} from '@shared/services/prompt/prompt.service';
import { Deferred } from '@root/vendor/deferred';
import { FolderPickerOperations } from '@core/components/folder-picker/folder-picker.component';
import { AccountService } from '@shared/services/account/account.service';
import { Dialog } from '@root/app/dialog/dialog.service';
import { DeviceService } from '@shared/services/device/device.service';
import { SecretsService } from '@shared/services/secrets/secrets.service';

import type { KeysOfType } from '@shared/utilities/keysoftype';
import { FolderPickerService } from '../folder-picker/folder-picker.service';

export const ItemActions: { [key: string]: PromptButton } = {
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
    buttonText: 'Download',
  },
  Delete: {
    buttonName: 'delete',
    buttonText: 'Delete',
    class: 'btn-danger',
  },
  Share: {
    buttonName: 'share',
    buttonText: 'Share',
  },
  Unshare: {
    buttonName: 'delete',
    buttonText: 'Remove',
    class: 'btn-danger',
  },
  Publish: {
    buttonName: 'publish',
    buttonText: 'Publish',
  },
  GetLink: {
    buttonName: 'publish',
    buttonText: 'Get link',
  },
  SetFolderView: {
    buttonName: 'setFolderView',
    buttonText: 'Set folder view',
  },
  Tags: {
    buttonName: 'tags',
    buttonText: 'Tags',
  },
};

export type ActionType =
  | 'delete'
  | 'rename'
  | 'share'
  | 'publish'
  | 'download'
  | 'copy'
  | 'move'
  | 'setFolderView'
  | 'tags';

type EditServiceClipboardOperation = 'copy' | 'move';

interface EditServiceClipboard {
  items: ItemVO[];
  operation: EditServiceClipboardOperation;
}

@Injectable()
export class EditService {
  private clipboard: EditServiceClipboard;

  private deleteSubject = new Subject<void>();
  public deleteNotifier$ = this.deleteSubject.asObservable();

  private isGoogleMapsApiLoaded = false;
  private googleMapsLoadedDeferred: Deferred;

  private debug = debug('service:editService');

  constructor(
    private api: ApiService,
    private message: MessageService,
    private folderPicker: FolderPickerService,
    private dataService: DataService,
    private prompt: PromptService,
    private accountService: AccountService,
    private dialog: Dialog,
    private device: DeviceService,
    private secrets: SecretsService
  ) {
    this.loadGoogleMapsApi();
  }

  loadGoogleMapsApi() {
    if (window['doNotLoadGoogleMapsAPI']) {
      this.debug('Google Maps API disabled in testing environment');
      return;
    }

    if (window['google']?.maps) {
      this.debug('Google Maps API already loaded, skipping');
      this.isGoogleMapsApiLoaded = true;
      return;
    }

    if (!this.isGoogleMapsApiLoaded) {
      this.googleMapsLoadedDeferred = new Deferred();

      const script = document.createElement('script');
      const callbackName = '__gmapsLoaded';
      const apiKey = this.secrets.get('GOOGLE_API_KEY');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=places`;
      script.defer = true;
      script.async = true;

      window[callbackName] = () => {
        this.isGoogleMapsApiLoaded = true;
        this.googleMapsLoadedDeferred.resolve();
        this.debug('Google Maps API loaded');
      };

      document.head.appendChild(script);
    }
  }

  waitForGoogleMapsApi() {
    if (this.isGoogleMapsApiLoaded) {
      return Promise.resolve();
    } else {
      return this.googleMapsLoadedDeferred.promise;
    }
  }

  sendToClipboard(items: ItemVO[], operation: EditServiceClipboardOperation) {
    this.clipboard = {
      items,
      operation,
    };
  }

  executeClipboard() {}

  promptForAction(items: ItemVO[], actions: PromptButton[] = []) {
    const actionDeferred = new Deferred();

    let title;

    if (items.length > 1) {
      title = `${items.length} items selected`;
    } else {
      title = items[0].displayName;
    }

    if (actions.length) {
      this.prompt
        .promptButtons(actions, title, actionDeferred.promise)
        .then((value: ActionType) => {
          this.handleAction(items, value, actionDeferred);
        })
        .catch((err) => {});
    } else {
      try {
        this.prompt.confirm(
          'OK',
          title,
          null,
          null,
          `<p>No actions available</p>`
        );
      } catch (err) {}
    }
  }

  async handleAction(
    items: ItemVO[],
    value: ActionType,
    actionDeferred: Deferred
  ) {
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
          this.openPublishDialog(items[0]);
          break;
        case 'share':
          const response: ShareResponse = await this.api.share.getShareLink(
            items[0]
          );
          actionDeferred.resolve();
          this.dialog.open('SharingComponent', {
            item: items[0],
            link: response.getShareByUrlVO(),
          });
          break;
        default:
          actionDeferred.resolve();
      }
    } catch (err) {
      if (err instanceof FolderResponse || err instanceof RecordResponse) {
        this.message.showError({ message: err.getMessage(), translate: true });
      }
      actionDeferred.resolve();
    }
  }

  createFolder(
    folderName: string,
    parentFolder: FolderVO
  ): Promise<FolderVO | FolderResponse> {
    const newFolder = new FolderVO({
      parentFolderId: parentFolder.folderId,
      parentFolder_linkId: parentFolder.folder_linkId,
      displayName: folderName,
    });

    return this.api.folder
      .post([newFolder])
      .then((response: FolderResponse) => {
        return response.getFolderVO();
      });
  }

  async deleteItems(
    items: any[]
  ): Promise<FolderResponse | RecordResponse | any> {
    let folders: FolderVO[];
    let records: RecordVO[];

    items.forEach((i) => (i.isPendingAction = true));

    [folders, records] = partition(items, 'isFolder') as any[];

    const promises: Array<Promise<any>> = [];

    if (folders.length) {
      promises.push(this.api.folder.delete(folders));
    } else {
      promises.push(Promise.resolve());
    }

    if (records.length) {
      promises.push(this.api.record.delete(records));
    } else {
      promises.push(Promise.resolve());
    }

    try {
      const results = await Promise.all(promises);
      let folderResponse, recordResponse;
      [folderResponse, recordResponse] = results;
      this.dataService.hideItemsInCurrentFolder(items);
      this.deleteSubject.next();
    } catch (err) {
      items.forEach((i) => (i.isPendingAction = false));
      throw err;
    } finally {
      this.accountService.refreshAccountDebounced();
    }
  }

  async unshareItem(item: ItemVO) {
    const shareVO = new ShareVO({
      folder_linkId: item.folder_linkId,
      archiveId: this.accountService.getArchive().archiveId,
    });

    await this.api.share.remove(shareVO);
    this.dataService.itemUnshared(item);
  }

  public async saveItemVoProperty(
    item: ItemVO,
    property: KeysOfType<ItemVO, string>,
    value: string
  ) {
    if (item) {
      const originalValue = item[property];
      const newData: Partial<ItemVO> = {};
      newData[property] = value;
      try {
        item.update(newData);
        await this.updateItems([item], [property]);
      } catch (err) {
        if (err instanceof FolderResponse || err instanceof RecordResponse) {
          const revertData: Partial<ItemVO> = {};
          revertData[property] = originalValue;
          item.update(revertData);
        }
      }
    }
  }

  updateItems(
    items: any[],
    whitelist?: (keyof ItemVO)[]
  ): Promise<FolderResponse | RecordResponse | any> {
    const folders: FolderVO[] = [];
    const records: RecordVO[] = [];

    const itemsByLinkId: { [key: number]: ItemVO } = {};

    const recordsByRecordId: Map<number, RecordVO> = new Map();
    const foldersByFolderId: Map<number, FolderVO> = new Map();

    items.forEach((item) => {
      item.isFolder ? folders.push(item) : records.push(item);
      itemsByLinkId[item.folder_linkId] = item;
      if (item instanceof RecordVO) {
        if (item.recordId) {
          recordsByRecordId.set(item.recordId, item);
        }
      } else {
        if (item.folderId) {
          foldersByFolderId.set(item.folderId, item);
        }
      }
    });

    const promises: Array<Promise<any>> = [];

    if (folders.length) {
      promises.push(this.api.folder.update(folders, whitelist));
    } else {
      promises.push(Promise.resolve());
    }

    if (records.length) {
      promises.push(this.api.record.update(records, whitelist));
    } else {
      promises.push(Promise.resolve());
    }

    return Promise.all(promises).then((results) => {
      let folderResponse: FolderResponse;
      let recordResponse: RecordResponse;

      [folderResponse, recordResponse] = results;
      if (folderResponse) {
        folderResponse.getFolderVOs().forEach((updatedItem) => {
          const newData: FolderVOData = {
            updatedDT: updatedItem.updatedDT,
          };

          if (updatedItem.TimezoneVO) {
            newData.TimezoneVO = updatedItem.TimezoneVO;
          }

          const folder =
            (itemsByLinkId[updatedItem.folder_linkId] as FolderVO) ||
            foldersByFolderId.get(updatedItem.folderId);
          folder.update(newData);
        });
      }

      if (recordResponse) {
        recordResponse.getRecordVOs().forEach((updatedItem) => {
          const newData: RecordVOData = {
            updatedDT: updatedItem.updatedDT,
          };

          if (updatedItem.TimezoneVO) {
            newData.TimezoneVO = updatedItem.TimezoneVO;
          }

          const record =
            (itemsByLinkId[updatedItem.folder_linkId] as RecordVO) ||
            recordsByRecordId.get(updatedItem.recordId);
          record.update(newData);
        });
      }
    });
  }

  moveItems(
    items: ItemVO[],
    destination: FolderVO
  ): Promise<FolderResponse | RecordResponse | any> {
    const folders: FolderVO[] = [];
    const records: RecordVO[] = [];

    const itemsByLinkId: { [key: number]: ItemVO } = {};

    items.forEach((item) => {
      item instanceof FolderVO ? folders.push(item) : records.push(item);
      itemsByLinkId[item.folder_linkId] = item;
      item.isPendingAction = true;
    });

    const promises: Array<Promise<any>> = [];

    if (folders.length) {
      promises.push(this.api.folder.move(folders, destination));
    } else {
      promises.push(Promise.resolve());
    }

    if (records.length) {
      promises.push(this.api.record.move(records, destination));
    } else {
      promises.push(Promise.resolve());
    }

    return Promise.all(promises)
      .then((results) => {
        this.dataService.hideItemsInCurrentFolder(items);
        return results;
      })
      .catch((err) => {
        items.forEach((item) => (item.isPendingAction = false));
        throw err;
      });
  }

  copyItems(
    items: any[],
    destination: FolderVO
  ): Promise<FolderResponse | RecordResponse | any> {
    const folders: FolderVO[] = [];
    const records: RecordVO[] = [];

    const itemsByLinkId: { [key: number]: ItemVO } = {};

    items.forEach((item) => {
      item.isFolder ? folders.push(item) : records.push(item);
      itemsByLinkId[item.folder_linkId] = item;
    });

    const promises: Array<Promise<any>> = [];

    if (folders.length) {
      promises.push(this.api.folder.copy(folders, destination));
    } else {
      promises.push(Promise.resolve());
    }

    if (records.length) {
      promises.push(this.api.record.copy(records, destination));
    } else {
      promises.push(Promise.resolve());
    }

    Promise.all(promises).then(() => {
      this.accountService.refreshAccountDebounced();
    });

    return Promise.all(promises);
  }

  async openShareDialog(item: ItemVO) {
    const response = await this.api.share.getShareLink(item);
    if (this.device.isMobile()) {
      try {
        this.dialog.open('SharingComponent', {
          item,
          link: response.getShareByUrlVO(),
        });
      } catch (err) {}
    } else {
      try {
        this.dialog.open(
          'SharingDialogComponent',
          { item, link: response.getShareByUrlVO() },
          { menuClass: 'split-dialog', width: '600px' }
        );
      } catch (err) {}
    }
  }

  async openPublishDialog(item: ItemVO) {
    this.dialog.open('PublishComponent', { item }, { height: 'auto' });
  }

  async openTagsDialog(item: ItemVO, type: string) {
    this.dialog.open('EditTagsComponent', { item, type }, { height: 'auto' });
  }

  async openLocationDialog(item: ItemVO) {
    this.dialog.open(
      'LocationPickerComponent',
      { item },
      { height: 'auto', width: '600px' }
    );
  }

  public openFolderPicker(
    items: ItemVO[],
    operation: FolderPickerOperations
  ): Promise<void> {
    const deferred = new Deferred();
    const rootFolder = this.accountService.getRootFolder();

    const filterFolderLinkIds = [];

    for (const item of items) {
      if (item.isFolder) {
        filterFolderLinkIds.push(item.folder_linkId);
      }
    }

    return new Promise<void>((resolve, reject) => {
      this.folderPicker
        .chooseFolder(
          rootFolder,
          operation,
          deferred.promise,
          filterFolderLinkIds
        )
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
            const msg = `${items.length} item(s) ${
              operation === FolderPickerOperations.Copy ? 'copied' : 'moved'
            } successfully.`;
            this.message.showMessage({ message: msg, style: 'success' });
            resolve();
          }, 500);
        })
        .catch((response: FolderResponse | RecordResponse) => {
          deferred.reject();
          this.message.showError({
            message: response.getMessage(),
            translate: true,
          });
        });
    });
  }
}
