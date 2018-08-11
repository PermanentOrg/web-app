import { Injectable, EventEmitter } from '@angular/core';

import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';

import { ApiService } from '@shared/services/api/api.service';

import { FolderVO } from '@root/app/models';

import { Uploader, UploadSessionStatus } from './uploader';
import { UploadItem } from '@core/services/upload/uploadItem';


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  public uploader: Uploader = new Uploader(this.api);
  private component: UploadProgressComponent;

  constructor(private api: ApiService) {
  }

  uploadFiles(parentFolder: FolderVO, files: File[]) {
    return this.uploader.openSocketConnection()
    .then(() => {
      return this.uploader.uploadFiles(parentFolder, files);
    });
  }

  registerComponent(component: UploadProgressComponent) {
    this.component = component;
  }
}
