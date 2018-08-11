import { BinaryClient, binaryFeatures } from '@root/vendor/binary';
import { map } from 'rxjs/operators';
import { remove } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';

import { EventEmitter } from '@angular/core';
import { FolderVO } from '@root/app/models';
import { UploadItem, UploadStatus } from './uploadItem';
import { RecordResponse } from '@shared/services/api/index.repo';

const SOCKET_CHUNK_SIZE = 122880;

export class Uploader {
  private socketClient: BinaryClient;
  public uploadItem: EventEmitter<UploadItem> = new EventEmitter();

  private uploadItemsById: {[key: number]: UploadItem} = {};

  public uploadItemList: UploadItem[] = [];
  private metaQueue: UploadItem[] = [];
  private uploadQueue: UploadItem[] = [];
  private errorQueue: UploadItem[] = [];

  public fileCount = {
    current: 0,
    total: 0
  };

  public uploadInProgress: boolean;

  private uploadPromise: Promise<boolean>;
  private uploadResolve: Function;
  private uploadReject: Function;

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

    console.log('already open');

    return Promise.resolve(true);
  }

  closeSocketConnection() {
    if (this.socketClient) {
      this.socketClient.close();
    }
  }

  uploadFiles(parentFolder: FolderVO, files: File[]): Promise<any> {
    files.forEach((file) => {
      const uploadItem = new UploadItem(file, parentFolder, this.uploadItemId++);
      this.uploadItemsById[uploadItem.uploadItemId] = uploadItem;
      this.uploadItemList.push(uploadItem);
      this.metaQueue.push(uploadItem);
      this.fileCount.total++;
    });

    if (this.metaQueue.length) {
      return this.postMetaFromQueue()
      .then(() => {
        if (!this.uploadInProgress) {
          this.uploadPromise = new Promise((resolve, reject) => {
            this.uploadResolve = resolve;
            this.uploadReject = reject;
          });
          this.uploadInProgress = true;
          this.uploadNextFromQueue();
        }

        return this.uploadPromise;
      });
    } else {
      return Promise.resolve();
    }
  }

  postMetaFromQueue() {
    // use entire meta queue for current batch
    const queue = this.metaQueue;
    this.metaQueue = [];

    const recordVOs = queue.map((uploadItem) => uploadItem.RecordVO);

    return this.api.record.postMeta(recordVOs)
      .pipe(map((response: RecordResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response;
      })).toPromise()
      .then((response: RecordResponse) => {
        const createdRecordVOs = response.getRecordVOs();

        // transition current batch to upload queue
        this.uploadQueue = this.uploadQueue.concat(queue.map((uploadItem, i) => {
          uploadItem.uploadStatus = UploadStatus.Meta;
          uploadItem.RecordVO = createdRecordVOs[i];
          return uploadItem;
        }));

        return Promise.resolve();
      })
      .catch((response: RecordResponse) => {
        // failed, put current batch back in meta queue
        this.metaQueue = queue.concat(this.metaQueue);
      });
  }

  uploadNextFromQueue() {
    const currentItem = this.uploadQueue.shift();
    if (!currentItem) {
      return this.checkForNextOrFinish();
    }

    this.fileCount.current++;
    this.uploadItem.emit(currentItem);

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
        currentItem.transferProgress += data.fileProg;
      }

      if (data.done) {
        this.checkForNextOrFinish();
      }
    });

    stream.on('error', () => {
      this.errorQueue.push(currentItem);
      this.checkForNextOrFinish();
    });
  }

  checkForNextOrFinish() {
    if (this.uploadQueue.length) {
      this.uploadNextFromQueue();
    } else {
      this.uploadInProgress = false;
      this.uploadResolve();

      this.uploadReject = null;
      this.uploadResolve = null;
      this.uploadPromise = null;
    }
  }
}
