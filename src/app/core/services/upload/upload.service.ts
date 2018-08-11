import { Injectable, EventEmitter } from '@angular/core';

import { Uploader } from './uploader';
import { FolderVO } from '@root/app/models';
import { ApiService } from '@shared/services/api/api.service';
import { UploadItem } from '@core/services/upload/uploadItem';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  public uploader: Uploader = new Uploader(this.api);

  constructor(private api: ApiService) {
  }

  uploadFiles(parentFolder: FolderVO, files: File[]) {
    return this.uploader.openSocketConnection()
    .then(() => {
      return this.uploader.uploadFiles(parentFolder, files);
    });
  }
}
