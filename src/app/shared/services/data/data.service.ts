import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { partition, remove, find } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { FolderVO, RecordVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { FolderResponse, RecordResponse } from '@shared/services/api/index.repo';
import { EventEmitter } from '@angular/core';

const THUMBNAIL_REFRESH_INTERVAL = 7500;

@Injectable()
export class DataService {
  public currentFolder: FolderVO;
  public currentFolderChange: EventEmitter<FolderVO> = new EventEmitter<FolderVO>();

  public folderUpdate: EventEmitter<FolderVO> = new EventEmitter<FolderVO>();

  private byFolderLinkId: {[key: number]: FolderVO | RecordVO};
  private thumbRefreshQueue: Array<FolderVO | RecordVO> = [];
  private thumbRefreshTimeout;

  constructor(private api: ApiService) {
    this.byFolderLinkId = {};
  }

  public registerItem(item: FolderVO | RecordVO) {
    this.byFolderLinkId[item.folder_linkId] = item;
  }

  public deregisterItem(item: FolderVO | RecordVO) {
    delete this.byFolderLinkId[item.folder_linkId];
  }

  public setCurrentFolder(folder?: FolderVO) {
    this.currentFolder = folder;
    this.currentFolderChange.emit(folder);

    clearTimeout(this.thumbRefreshTimeout);
    this.thumbRefreshQueue = [];

    if (this.currentFolder) {
      this.scheduleMissingThumbsCheck();
    }
  }

  public fetchLeanItems(items: Array<FolderVO | RecordVO>, currentFolder ?: FolderVO): Promise<number> {
    const itemResolves = [];
    const itemRejects = [];
    if (!currentFolder) {
      currentFolder = this.currentFolder;
    }
    const folder = new FolderVO({
      archiveNbr: currentFolder.archiveNbr,
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
            item.update(leanItem);
            item.dataStatus = DataStatus.Lean;
            item.isFetching = false;
            itemResolves[index]();
            item.fetched = null;

            if (!item.thumbURL200 && item.parentFolderId === this.currentFolder.folderId) {
              this.thumbRefreshQueue.push(item);
            }
          }
        });

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

  public fetchFullItems(items: Array<FolderVO | RecordVO>) {
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

    promises.push(records.length ? this.api.record.get(records).toPromise() : Promise.resolve());
    promises.push(folders.length ? this.api.folder.get(folders).toPromise() : Promise.resolve());

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
      }

      for (let i = 0; i < folders.length; i++) {
        folders[i].update(fullFolders[i]);
      }

      itemResolves.map((resolve, index) => {
        items[index].fetched = null;
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

  public getLocalItems(folderLinkIds: number[]) {

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
      console.log(fileVO);
      const link = document.createElement('a');
      link.href = fileVO.downloadURL;
      link.download = `${item.displayName}.${fileVO.type.split('.').pop()}`;
      link.click();
    }

    function getOriginalFile(fileItem: RecordVO) {
      return find(fileItem.FileVOs, {format: 'file.format.original'});
    }
  }
}
