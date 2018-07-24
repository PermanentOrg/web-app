import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from '@shared/services/api/api.service';
import { FolderVO, RecordVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { FolderResponse } from '@shared/services/api/index.repo';
import { EventEmitter } from '@angular/core';

@Injectable()
export class DataService {
  public currentFolderChange: EventEmitter<FolderVO> = new EventEmitter<FolderVO>();

  private byFolderLinkId: {[key: number]: FolderVO | RecordVO};
  public currentFolder: FolderVO;

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
  }

  public fetchLeanItems(items: Array<FolderVO | RecordVO>): Promise<number> {

    const folder = new FolderVO({
      archiveNbr: this.currentFolder.archiveNbr,
      ChildItemVOs: items.filter((item) => {
          if (item.isFetching || item.dataStatus >= DataStatus.Lean) {
            return false;
          }

          item.isFetching = true;
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
        leanItems.map((leanItem) => {
          const item = this.byFolderLinkId[leanItem.folder_linkId];
          if (item) {
            item.update(leanItem);
            item.dataStatus = DataStatus.Lean;
            item.isFetching = false;
          }
        });

        return Promise.resolve(leanItems.length);
      })
      .catch((response) => {
        console.error(response.getMessage());
      });
  }

  public fetchFullItems(folderLinkIds: number[]) {

  }

  public getLocalItems(folderLinkIds: number[]) {

  }
}
