import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { partition, remove, find, findIndex } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { FolderVO, RecordVO, ItemVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { FolderResponse, RecordResponse } from '@shared/services/api/index.repo';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

const THUMBNAIL_REFRESH_INTERVAL = 7500;

export type SelectedItemsMap = Map<ItemVO, boolean>;

export interface SelectKeyEvent {
  type: 'key';
  direction: 'up' | 'down';
  modifierKey?: 'ctrl' | 'shift';
}

export interface SelectClickEvent {
  type: 'click';
  item: RecordVO | FolderVO;
  modifierKey?: 'ctrl' | 'shift';
}

export type SelectEvent = SelectClickEvent | SelectKeyEvent;

@Injectable()
export class DataService {
  public currentFolder: FolderVO;
  public currentFolderChange: EventEmitter<FolderVO> = new EventEmitter<FolderVO>();

  public showBreadcrumbs = true;
  public showPublicArchiveDescription = true;
  public publicCta: 'timeline';

  public folderUpdate: EventEmitter<FolderVO> = new EventEmitter<FolderVO>();

  public multiSelectEnabled = false;
  public multiSelectChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  private byFolderLinkId: {[key: number]: FolderVO | RecordVO} = {};
  private byArchiveNbr: {[key: string]: FolderVO | RecordVO} = {};
  private thumbRefreshQueue: Array<FolderVO | RecordVO> = [];
  private thumbRefreshTimeout;

  public multiSelectItems: Map<number, ItemVO> = new Map();

  private selectedItems: SelectedItemsMap = new Map();
  private selectedItemsSubject: Subject<SelectedItemsMap> = new Subject();
  private lastManualSelectItem: ItemVO;

  constructor(private api: ApiService) {
  }

  public registerItem(item: FolderVO | RecordVO) {
    this.byFolderLinkId[item.folder_linkId] = item;
    if (item.archiveNbr) {
      this.byArchiveNbr[item.archiveNbr] = item;
    }
  }

  public deregisterItem(item: FolderVO | RecordVO) {
    delete this.byFolderLinkId[item.folder_linkId];
    if (item.archiveNbr) {
      delete this.byArchiveNbr[item.archiveNbr];
    }
  }

  public setCurrentFolder(folder?: FolderVO, isPage?: boolean) {
    this.currentFolder = folder;
    this.currentFolderChange.emit(folder);

    this.clearSelectedItems();

    clearTimeout(this.thumbRefreshTimeout);
    this.thumbRefreshQueue = [];

    if (this.currentFolder && !isPage) {
      this.scheduleMissingThumbsCheck();
    }
  }

  public fetchLeanItems(items: Array<FolderVO | RecordVO>, currentFolder ?: FolderVO): Promise<number> {
    const itemResolves = [];
    const itemRejects = [];
    let handleItemRegistration = false;

    if (!currentFolder) {
      currentFolder = this.currentFolder;
    } else {
      handleItemRegistration = true;
      items.map(item => {
        this.registerItem(item);
      });
    }
    const folder = new FolderVO({
      archiveNbr: currentFolder.archiveNbr,
      folder_linkId: currentFolder.folder_linkId,
      ChildItemVOs: items.filter((item) => {
          if (item.isFetching) {
            return false;
          }

          item.isFetching = true;
          item.fetched = new Promise((resolve, reject) => {
            itemResolves.push(resolve);
            itemRejects.push(reject);
          });
          return true;
        }).map((item) => {
          return {
            folder_linkId: item.folder_linkId
          };
        })
    });

    if (!folder.ChildItemVOs.length) {
      return Promise.resolve(0);
    }

    return this.api.folder.getLeanItems([folder])
      .pipe(map((response: FolderResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        const fetchedFolder = response.getFolderVO();

        return fetchedFolder.ChildItemVOs;
      })).toPromise()
      .then((leanItems) => {
        leanItems.map((leanItem, index) => {
          const item = this.byFolderLinkId[leanItem.folder_linkId];
          if (item) {
            this.byArchiveNbr[leanItem.archiveNbr] = item;
            (item as FolderVO).update(leanItem);

            item.dataStatus = DataStatus.Lean;
            item.isFetching = false;
            itemResolves[index]();
            item.fetched = null;

            if (!item.thumbURL200 && item.parentFolderId === this.currentFolder.folderId) {
              this.thumbRefreshQueue.push(item);
            }
          }
        });

        if (handleItemRegistration) {
          items.map(item => {
            this.deregisterItem(item);
          });
        }

        return Promise.resolve(leanItems.length);
      })
      .catch((response) => {
        itemRejects.map((reject, index) => {
          items[index].fetched = null;
          reject();
        });
        console.error(response);
      });
  }

  public fetchFullItems(items: Array<FolderVO | RecordVO>, withChildren?: boolean) {
    const itemResolves = [];
    const itemRejects = [];

    const records: Array<any | RecordVO> = [];
    const folders: Array<any | FolderVO> = [];

    items.forEach((item) => {
      item.isFetching = true;
      item.fetched = new Promise((resolve, reject) => {
        itemResolves.push(resolve);
        itemRejects.push(reject);
      });

      if (item.isRecord) {
        records.push(item);
      } else {
        folders.push(item);
      }
    });

    const promises: Promise<any>[] = [];

    promises.push(records.length ? this.api.record.get(records) : Promise.resolve());

    if (!withChildren) {
      promises.push(folders.length ? this.api.folder.get(folders) : Promise.resolve());
    } else {
      promises.push(folders.length ? this.api.folder.getWithChildren(folders) : Promise.resolve());
    }

    return Promise.all(promises)
    .then((results) => {
      let recordResponse: RecordResponse;
      let folderResponse: FolderResponse;

      [ recordResponse, folderResponse ] = results;

      let fullRecords: Array<any | RecordVO>;
      let fullFolders: Array<any | FolderVO>;

      if (recordResponse) {
        fullRecords = recordResponse.getRecordVOs();
      }

      if (folderResponse) {
        fullFolders = folderResponse.getFolderVOs();
      }

      for (let i = 0; i < records.length; i++) {
        records[i].update(fullRecords[i]);
        records[i].dataStatus = DataStatus.Full;
      }

      for (let i = 0; i < folders.length; i++) {
        folders[i].update(fullFolders[i]);
        folders[i].dataStatus = DataStatus.Full;
      }

      itemResolves.map((resolve, index) => {
        items[index].fetched = null;
        this.byArchiveNbr[items[index].archiveNbr] = items[index];
        resolve();
      });

      return Promise.resolve(true);
    })
    .catch((response) => {
      itemRejects.map((reject, index) => {
        items[index].fetched = null;
        reject();
      });
      console.error(response);
    });
  }

  public refreshCurrentFolder() {
    return this.api.folder.navigate(this.currentFolder)
      .pipe(map(((response: FolderResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response.getFolderVO(true);
      }))).toPromise()
      .then((folder: FolderVO) => {
        this.currentFolder.update(folder);
        this.folderUpdate.emit(this.currentFolder);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public checkMissingThumbs() {
    if (!this.currentFolder) {
      return;
    }

    if (!this.thumbRefreshQueue.length) {
      return this.scheduleMissingThumbsCheck();
    }

    const itemsToCheck = this.thumbRefreshQueue;
    this.thumbRefreshQueue = [];
    this.fetchLeanItems(itemsToCheck)
      .then(() => {
        this.scheduleMissingThumbsCheck();
      });
  }

  public scheduleMissingThumbsCheck() {
    this.thumbRefreshTimeout = setTimeout(() => {
      this.checkMissingThumbs();
    }, THUMBNAIL_REFRESH_INTERVAL);
  }

  public getItemByArchiveNbr(archiveNbr: string): RecordVO | FolderVO {
    return this.byArchiveNbr[archiveNbr];
  }

  public getItemByFolderLinkId(folder_linkId: number): RecordVO | FolderVO {
    return this.byFolderLinkId[folder_linkId];
  }

  public getItemsByFolderLinkIds(folder_linkIds: (number | string)[]): Array<RecordVO | FolderVO> {
    return folder_linkIds.map(id => {
      return this.getItemByFolderLinkId(Number(id));
    });
  }

  public downloadFile(item: RecordVO): Promise<any> {
    if (item.FileVOs && item.FileVOs.length) {
      downloadOriginalFile(item);
      return Promise.resolve();
    } else {
      return this.fetchFullItems([item])
      .then(() => {
        downloadOriginalFile(item);
      });
    }

    function downloadOriginalFile(fileItem: any) {
      const fileVO = getOriginalFile(fileItem) as any;
      const link = document.createElement('a');
      link.href = fileVO.downloadURL;
      link.click();
    }

    function getOriginalFile(fileItem: RecordVO) {
      return find(fileItem.FileVOs, {format: 'file.format.original'});
    }
  }

  public selectedItems$() {
    return this.selectedItemsSubject.asObservable();
  }

  public onSelectEvent(selectEvent: SelectEvent) {
    switch (selectEvent.type) {
      case 'click':
        switch (selectEvent.modifierKey) {
          case 'ctrl':
            this.selectItemSingle(selectEvent.item, false);
            break;
          case 'shift':
            this.selectItemsBetween(this.lastManualSelectItem, selectEvent.item);
            break;
          default:
            this.selectItemSingle(selectEvent.item);
        }
        break;
      case 'key':
        const items = this.currentFolder.ChildItemVOs;
        const index = this.lastManualSelectItem ? findIndex(items, this.lastManualSelectItem) : 0;
        let newIndex = index + (selectEvent.direction === 'up' ? -1 : 1);
        newIndex = Math.max(0, newIndex);
        newIndex = Math.min(items.length - 1, newIndex);
        const newItem = items[newIndex];

        this.lastManualSelectItem = newItem;

        if (!selectEvent.modifierKey) {
          this.selectItemSingle(newItem);
        } else {
          this.selectItemSingle(newItem, false);
        }

        break;
    }
  }

  clearSelectedItems() {
    this.selectedItems.clear();
    this.selectedItemsSubject.next(this.selectedItems);
  }

  selectItemSingle(item: ItemVO, replace = true) {
    if (replace) {
      this.lastManualSelectItem = item;
    }

    if (this.selectedItems.has(item)) {
      if (this.selectedItems.size > 1 && replace) {
        this.selectedItems.clear();
        this.selectedItems.set(item, true);
      } else if (replace) {
        this.selectedItems.clear();
      }
    } else {
      if (replace) {
        this.selectedItems.clear();
      }
      this.selectedItems.set(item, true);
    }

    this.selectedItemsSubject.next(this.selectedItems);
  }

  fetchSelectedItems() {
    return this.fetchFullItems(Array.from(this.selectedItems.keys()));
  }

  selectItemsBetween(item1: ItemVO, item2: ItemVO) {
    const items = this.currentFolder.ChildItemVOs;
    const item1Index = item1 ? findIndex(items, item1) : 0;
    const item2Index = findIndex(items, item2);

    this.selectedItems.clear();

    let current = Math.min(item1Index, item2Index);
    const end = Math.max(item1Index, item2Index);

    while (current <= end) {
      this.selectedItems.set(items[current++], true);
    }

    this.selectedItemsSubject.next(this.selectedItems);
  }

  public setMultiSelect(enabled: boolean) {
    this.multiSelectEnabled = enabled;
    this.multiSelectChange.emit(enabled);

    if (!this.multiSelectEnabled) {
      setTimeout(() => {
        this.multiSelectItems.clear();
      }, 500);
    }
  }

  public setItemMultiSelectStatus(item: ItemVO, selected: boolean) {
    if (selected) {
      this.multiSelectItems.set(item.folder_linkId, item);
    } else {
      this.multiSelectItems.delete(item.folder_linkId);
    }
  }
}
