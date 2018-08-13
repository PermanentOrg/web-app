import { Injectable, EventEmitter } from '@angular/core';

import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';

import { ApiService } from '@shared/services/api/api.service';

import { FolderVO } from '@root/app/models';

import { Uploader, UploadSessionStatus } from './uploader';
import { UploadItem } from '@core/services/upload/uploadItem';
import { MessageService } from '@shared/services/message/message.service';
import { RecordResponse } from '@shared/services/api/index.repo';


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  public uploader: Uploader = new Uploader(this.api, this.message);

  constructor(private api: ApiService, private message: MessageService) {
  }

  uploadFiles(parentFolder: FolderVO, files: File[]) {
    return this.uploader.connectAndUpload(parentFolder, files)
      .catch((response: any) => {
        this.handleUploaderError(response);
      });
  }

  retryFiles() {
    return this.uploader.retryFiles()
      .catch((response: any) => {
        this.handleUploaderError(response);
      });
  }

  handleUploaderError(response: any) {
    if (response && typeof response.getMessage === 'function') {
      if (response.messageIncludesPhrase('no_space_left')) {
        this.message.showError('You do not have enough storage available to upload these files.');
      }
    }
  }
}
