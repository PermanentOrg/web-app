import { BinaryClient, binaryFeatures } from '@root/vendor/binary';
import { map } from 'rxjs/operators';
import { remove, partition } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

import { EventEmitter } from '@angular/core';
import { FolderVO } from '@root/app/models';
import { UploadItem, UploadStatus } from './uploadItem';
import { RecordResponse } from '@shared/services/api/index.repo';

const SOCKET_CHUNK_SIZE = 122880;

export enum UploadSessionStatus {
  Start,
  InProgress,
  Done,
  FileError,
  ConnectionError,
  StorageError
}

export class Uploader {
  private socketClient: BinaryClient;

  public uploadItem: EventEmitter<UploadItem> = new EventEmitter();

  public uploadSessionStatus: EventEmitter<UploadSessionStatus> = new EventEmitter();

  private uploadItemsById: {[key: number]: UploadItem} = {};
  public uploadItemList: UploadItem[] = [];
  private metaQueue: UploadItem[] = [];
  private uploadQueue: UploadItem[] = [];
  private errorQueue: UploadItem[] = [];

  public fileCount = {
    current: 0,
    completed: 0,
    total: 0,
    error: 0
  };

  public uploadInProgress: boolean;

  private uploadPromise: Promise<boolean>;
  private uploadResolve: Function;
  private uploadReject: Function;

  private uploadItemId = 0;

  constructor(private api: ApiService) {
  }

  openSocketConnection() {
    let connectionReject;

    const failedToConnect = (error) => {
      this.uploadSessionStatus.emit(UploadSessionStatus.ConnectionError);
      connectionReject();
      this.socketClient = null;
    };

    if (!this.socketClient) {
      return new Promise((resolve, reject) => {
        connectionReject = reject;

        this.socketClient = new BinaryClient(`wss://${location.hostname}:9000/uploadsvc`, {
          chunkSize: SOCKET_CHUNK_SIZE
        });
        this.socketClient.on('open', () => {
          this.fileCount.current = 0;
          this.fileCount.completed = 0;
          this.fileCount.total = 0;
          this.fileCount.error = 0;

          this.uploadSessionStatus.emit(UploadSessionStatus.Start);
          this.socketClient.removeListener('error', failedToConnect);
          this.socketClient.on('close', (event) => {
            this.onSocketClose(event);
          });
          this.socketClient.on('error', (err) => {
            this.onSocketError();
          });
          resolve();
        });
        this.socketClient.on('error', failedToConnect);
      });
    }

    return Promise.resolve(true);
  }

  closeSocketConnection() {
    if (this.socketClient) {
      this.socketClient.close();
      this.socketClient = null;
    }
  }

  onSocketError() {
    this.uploadSessionStatus.emit(UploadSessionStatus.ConnectionError);
    this.socketClient = null;
  }

  onSocketClose(event) {
    if (!event.wasClean && event.target.readyState === 3) {
      this.errorQueue = this.errorQueue.concat(this.metaQueue.concat(this.uploadQueue));
      this.onSocketError();
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
          this.uploadSessionStatus.emit(UploadSessionStatus.InProgress);
        }

        return this.uploadPromise;
      })
      .catch((response: RecordResponse) => {
        this.uploadSessionStatus.emit(UploadSessionStatus.Done);
        return Promise.reject(response);
      });
    } else {
      return Promise.resolve();
    }
  }

  postMetaFromQueue(): Promise<void | RecordResponse> {
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

        return Promise.reject(response);
      });
  }

  uploadNextFromQueue() {
    const currentItem = this.uploadQueue.shift();


    if (!currentItem) {
      return this.checkForNextOrFinish();
    }

    let transferComplete;

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
        transferComplete = true;
        this.fileCount.completed++;
        this.checkForNextOrFinish();
      }
    });

    stream.on('error', (err) => {
      this.fileCount.error++;
      this.errorQueue.push(currentItem);
      this.checkForNextOrFinish();
    });

    stream.on('close', (event) => {
      if (!transferComplete) {
        this.errorQueue.push(currentItem);
      }
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

      this.closeSocketConnection();
      this.uploadSessionStatus.emit(UploadSessionStatus.Done);
    }
  }

  retryFiles() {
    if (!this.errorQueue.length) {
      this.uploadSessionStatus.emit(UploadSessionStatus.Done);
      return Promise.resolve();
    }

    let hasMeta, needsMeta;

    [ hasMeta , needsMeta ] = partition(this.errorQueue, (item: UploadItem) => item.RecordVO.recordId);
    this.errorQueue = [];


    // put files that have RecordVOs in upload queue
    if (hasMeta.length) {
      this.uploadQueue = this.uploadQueue.concat(hasMeta);
    }

    let metaPromise: Promise<any> = Promise.resolve();

    // puts files that need RecordVOs in meta queue
    if (needsMeta.length) {
      this.metaQueue = this.metaQueue.concat(needsMeta);
      metaPromise = this.postMetaFromQueue();
    }

    // post meta for files if needed before finishing upload queue
    metaPromise
      .then(() => {
        return this.openSocketConnection();
      })
      .then(() => {
        this.uploadNextFromQueue();
        this.uploadSessionStatus.emit(UploadSessionStatus.InProgress);
      });
  }
}
