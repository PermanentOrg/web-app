import { Injectable, EventEmitter  } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { partition, remove } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';

import { FolderVO, RecordVO } from '@root/app/models';

import { DataStatus } from '@models/data-status.enum';

import { FolderResponse, RecordResponse } from '@shared/services/api/index.repo';

@Injectable({
  providedIn: 'root'
})
export class EditService {

  constructor(private api: ApiService) { }

  createFolder(folderName: string, parentFolder: FolderVO) {
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

  deleteItems(items: any[]) {
    let folders: FolderVO[];
    let records: RecordVO[];

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

    return Promise.all(promises)
      .then((results) => {
        let folderResponse, recordResponse;
        [folderResponse, recordResponse] =  results;
      });
  }
}
