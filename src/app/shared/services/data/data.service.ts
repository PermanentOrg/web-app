import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { partition, remove, find, findIndex } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { FolderVO, RecordVO, ItemVO, FolderVOData, RecordVOData, SortType } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { FolderResponse, RecordResponse } from '@shared/services/api/index.repo';
import { EventEmitter } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import debug from 'debug';
import { debugSubscribable } from '@shared/utilities/debug';

const THUMBNAIL_REFRESH_INTERVAL = 7500;

export type SelectedItemsMap = Map<ItemVO, boolean>;

export interface SelectKeyEvent {
  type: 'key';
  key?: 'up' | 'down' | 'a';
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
  private selectedItemsSubject: BehaviorSubject<SelectedItemsMap> = new BehaviorSubject(this.selectedItems);
  private lastManualSelectItem: ItemVO;
  private lastArrowSelectItem: ItemVO;

  private showItemSubject = new Subject<ItemVO>();

  private debug = debug('service:dataService');

  constructor(private api: ApiService) {
    debugSubscribable('currentFolderChange', this.debug, this.currentFolderChange);
    debugSubscribable('folderUpdate', this.debug, this.folderUpdate);
    debugSubscribable('selectedItems', this.debug, this.selectedItems$());
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
    if (folder === this.currentFolder) {
      return;
    }
    
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
    this.debug('fetchLeanItems %d items requested', items.length);

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
      this.debug('fetchLeanItems all items already fetching');
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
              this.debug('thumbRefreshQueue push %d', item.archiveNbr);
              this.thumbRefreshQueue.push(item);
            }
          }
        });

        if (handleItemRegistration) {
          items.map(item => {
            this.deregisterItem(item);
          });
        }

        this.debug('fetchLeanItems %d items fetched', leanItems.length);

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
    this.debug('fetchFullItems %d items requested', items.length);

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

      this.debug('fetchFullItems %d items fetched', items.length);

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

  public refreshCurrentFolder(sortOnly = false) {
    this.debug('refreshCurrentFolder (sortOnly = %o)', sortOnly);

    return this.api.folder.navigate(this.currentFolder)
      .pipe(map(((response: FolderResponse) => {
        this.debug('refreshCurrentFolder data fetched', sortOnly);

        if (!response.isSuccessful) {
          throw response;
        }

        return response.getFolderVO(true);
      }))).toPromise()
      .then((updatedFolder: FolderVO) => {
        this.updateChildItems(this.currentFolder, updatedFolder, sortOnly);
        this.debug('refreshCurrentFolder done', sortOnly);
        this.folderUpdate.emit(this.currentFolder);
      });
  }

  public updateChildItems(folder1: FolderVO, folder2: FolderVO, sortOnly = false) {
    this.debug('updateChildItems (sortOnly = %o)', sortOnly);

    if (!folder2.ChildItemVOs || !folder2.ChildItemVOs.length) {
      folder1.ChildItemVOs = folder2.ChildItemVOs;
      this.debug('updateChildItems done no child items', sortOnly);
      return;
    }

    const original = folder1.ChildItemVOs as ItemVO[];
    const updated = folder2.ChildItemVOs as ItemVO[];

    const originalItemsById = new Map<number, ItemVO>();
    const updatedItemsById = new Map<number, ItemVO>();

    const updatedOrderedIds: number[] = [];

    if (sortOnly) {
      for (const item of original) {
        originalItemsById.set(item.folder_linkId, item);
      }

      const sortedItems: ItemVO[] = updated.map(item => {
        return originalItemsById.get(item.folder_linkId);
      });

      folder1.ChildItemVOs = sortedItems;
    } else {
      for (const item of updated) {
        updatedItemsById.set(item.folder_linkId, item);
        updatedOrderedIds.push(item.folder_linkId);
      }

      for (const item of original) {
        originalItemsById.set(item.folder_linkId, item);

        if (updatedItemsById.has(item.folder_linkId)) {
          const updatedItem = updatedItemsById.get(item.folder_linkId);
          const dataToUpdate: FolderVOData | RecordVOData = {
            updatedDT: updatedItem.updatedDT,
          };
          item.update(dataToUpdate);
        } else {
          if (this.selectedItems.has(item)) {
            this.selectedItems.delete(item);
            this.selectedItemsSubject.next(this.selectedItems);
          }
        }
      }

      const finalUpdatedItems: ItemVO[] = updatedOrderedIds.map(id => {
        return originalItemsById.has(id) ? originalItemsById.get(id) : updatedItemsById.get(id);
      });

      folder1.ChildItemVOs = finalUpdatedItems;
    }

    this.debug('updateChildItems done %d items', folder1.ChildItemVOs.length);
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
    this.debug('checkMissingThumbs %d items', itemsToCheck.length);
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

  public getSelectedItems() {
    return this.selectedItemsSubject.value;
  }

  public onSelectEvent(selectEvent: SelectEvent) {
    switch (selectEvent.type) {
      case 'click':
        switch (selectEvent.modifierKey) {
          case 'ctrl':
            this.selectItemSingle(selectEvent.item, false);
            break;
          case 'shift':
            this.selectItemsBetweenItems(this.lastManualSelectItem, selectEvent.item);
            break;
          default:
            this.selectItemSingle(selectEvent.item);
        }
        break;
      case 'key':
        switch (selectEvent.key) {
          case 'up':
          case 'down':
            const items = this.currentFolder.ChildItemVOs;
            const index = this.lastManualSelectItem ? findIndex(items, this.lastManualSelectItem) : 0;
            if (!selectEvent.modifierKey) {
              let newIndex = index + (selectEvent.key === 'up' ? -1 : 1);
              newIndex = Math.max(0, newIndex);
              newIndex = Math.min(items.length - 1, newIndex);
              const newItem = items[newIndex];
              if (newItem !== this.lastManualSelectItem) {
                this.selectItemSingle(newItem);
              }
            } else {
              if (!this.lastArrowSelectItem) {
                this.lastArrowSelectItem = this.lastManualSelectItem;
              }
              const indexEnd = this.lastArrowSelectItem ? findIndex(items, this.lastArrowSelectItem) : 0;
              let newIndex = indexEnd + (selectEvent.key === 'up' ? -1 : 1);
              newIndex = Math.max(0, newIndex);
              newIndex = Math.min(items.length - 1, newIndex);
              const newItem = items[newIndex];
              this.selectItemsBetweenIndicies(index, newIndex);
              this.lastArrowSelectItem = newItem;
            }
            break;
          case 'a':
            this.selectItemsBetweenIndicies(0, this.currentFolder.ChildItemVOs.length - 1);
            break;
        }
        break;
    }
  }

  clearSelectedItems() {
    this.selectedItems.clear();
    this.selectedItemsSubject.next(this.selectedItems);
  }

  selectItemSingle(item: ItemVO, replace = true) {
    if (this.selectedItems.has(item)) {
      if (this.selectedItems.size > 1 && replace) {
        this.selectedItems.clear();
        this.selectedItems.set(item, true);
      } else if (replace) {
        this.selectedItems.clear();
      } else {
        this.selectedItems.delete(item);
      }
    } else {
      if (replace) {
        this.selectedItems.clear();
        this.lastManualSelectItem = this.lastArrowSelectItem = item;
      }
      this.selectedItems.set(item, true);
    }

    this.selectedItemsSubject.next(this.selectedItems);
  }

  fetchSelectedItems() {
    return this.fetchFullItems(Array.from(this.selectedItems.keys()));
  }

  selectItemsBetweenIndicies(item1Index: number, item2Index: number) {
    const items = this.currentFolder.ChildItemVOs;

    this.selectedItems.clear();

    let current = Math.min(item1Index, item2Index);
    const end = Math.max(item1Index, item2Index);

    while (current <= end) {
      this.selectedItems.set(items[current++], true);
    }

    this.selectedItemsSubject.next(this.selectedItems);
  }

  selectItemsBetweenItems(item1: ItemVO, item2: ItemVO) {
    const items = this.currentFolder.ChildItemVOs;
    const item1Index = item1 ? findIndex(items, item1) : 0;
    const item2Index = findIndex(items, item2);

    this.selectItemsBetweenIndicies(item1Index, item2Index);
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

  public showItem(item: ItemVO) {
    this.showItemSubject.next(item);
  }

  public itemToShow$() {
    return this.showItemSubject.asObservable();
  }
}
