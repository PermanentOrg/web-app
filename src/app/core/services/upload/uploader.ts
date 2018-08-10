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
  private uploadItemsById: {[key: number]: UploadItem} = {};

  public uploadItemList: UploadItem[] = [];
  private metaQueue: UploadItem[] = [];
  private uploadQueue: UploadItem[] = [];

  private uploadItemId = 0;

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
      const uploadItem = new UploadItem(file, parentFolder, this.uploadItemId++);
      this.uploadItemsById[uploadItem.uploadItemId] = uploadItem;
      this.uploadItemList.push(uploadItem);
      this.metaQueue.push(uploadItem);
    });

    if (this.metaQueue.length) {
      this.postMetaFromQueue()
      .then(() => {
        this.uploadFromQueue();
      });
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
        const createdRecordVOs = response.getRecordVOs();

        this.uploadQueue = this.metaQueue.map((uploadItem, i) => {
          uploadItem.uploadStatus = UploadStatus.Meta;
          uploadItem.RecordVO = createdRecordVOs[i];
          return uploadItem;
        });
        this.metaQueue = [];

        return Promise.resolve();
      })
      .catch((response: RecordResponse) => {

      });
  }

  uploadFromQueue() {
    const currentItem = this.uploadQueue.shift();

    const fileMeta = {
      name: currentItem.file.name,
      size: currentItem.file.size,
      recordid: currentItem.RecordVO.recordId
    };

    currentItem.uploadStatus = UploadStatus.Transfer;

    const stream = this.socketClient.send(currentItem.file, fileMeta);

    currentItem.streamId = stream.id;

    stream.on('data', (data) => {
      if (data.fileProg) {
        console.log('uploader.ts', 107, data.fileProg);
      } else if (data.done) {
        console.log('uploader.ts', 109, 'done?');
      }
    });
  }
}
