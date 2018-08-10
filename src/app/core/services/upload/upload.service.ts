import { Injectable } from '@angular/core';

import { Uploader } from './uploader';
import { FolderVO } from '@root/app/models';
import { ApiService } from '@shared/services/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private uploader: Uploader = new Uploader(this.api);

  constructor(private api: ApiService) {
  }

  uploadFiles(parentFolder: FolderVO, files: File[]) {
    return this.uploader.openSocketConnection()
    .then(() => {
      this.uploader.addFilesToQueue(parentFolder, files);
    });
  }
}
