import { BinaryClient, binaryFeatures } from '@root/vendor/binary';
import { map } from 'rxjs/operators';
import { remove } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';

import { FolderVO } from '@root/app/models';
import { UploadItem, UploadStatus } from './uploadItem';
import { RecordResponse } from '@shared/services/api/index.repo';

const SOCKET_CHUNK_SIZE = 122880;

export class Uploader {
  private socketClient: BinaryClient;
  private metaQueue: UploadItem[] = [];
  private uploadQueue: UploadItem[] = [];

  constructor(private api: ApiService) {
    if (binaryFeatures.supportsBinaryWebsockets) {
      this.openSocketConnection();
    } else {
      window.alert('Your device does not support uploading.');
    }
  }

  openSocketConnection() {
    if (!this.socketClient) {
      return new Promise((resolve, reject) => {
        this.socketClient = new BinaryClient(`wss://${location.hostname}:9000/uploadsvc`, {
          chunkSize: SOCKET_CHUNK_SIZE
        });
        this.socketClient.on('open', resolve);
      });
    }

    return Promise.resolve(true);
  }

  closeSocketConnection() {
    if (this.socketClient) {
      this.socketClient.close();
    }
  }

  addFilesToQueue(parentFolder: FolderVO, files: File[]) {
    files.forEach((file) => {
      this.metaQueue.push(new UploadItem(file, parentFolder));
    });

    if (this.metaQueue.length) {
      this.postMetaFromQueue();
    }
  }

  postMetaFromQueue() {
    const recordVOs = this.metaQueue.map((uploadItem) => uploadItem.RecordVO);

    return this.api.record.postMeta(recordVOs)
      .pipe(map((response: RecordResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response;
      })).toPromise()
      .then((response: RecordResponse) => {
        const postedRecordVOs = response.getRecordVOs();
        for (let i = 0; i < postedRecordVOs.length; i++) {
          const uploadItem = this.metaQueue[i];
          uploadItem.uploadStatus = UploadStatus.Meta;
        }

        this.uploadQueue = remove(this.metaQueue, {uploadStatus: UploadStatus.Meta});
      })
      .catch((response: RecordResponse) => {

      });
  }

  uploadFromQueue() {

  }
}
