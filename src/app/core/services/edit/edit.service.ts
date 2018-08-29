import { Injectable, EventEmitter  } from '@angular/core';
import { map } from 'rxjs/operators';
import { partition, remove } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';

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
      .pipe(map(((response: FolderResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response.getFolderVO(true);
      }))).toPromise();

  }

}
