import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiService } from '@shared/services/api/api.service';

import { EventEmitter } from '@angular/core';
import { FolderVO } from '@root/app/models';
import { UploadItem, UploadStatus } from './uploadItem';
import { BaseResponse } from '@shared/services/api/base';
import { RecordResponse } from '@shared/services/api/index.repo';

export enum UploadSessionStatus {
  Start,
  InProgress,
  Done,
  ConnectionError,
  StorageError
}

export interface UploadProgressEvent {
  item?: UploadItem;
  sessionStatus: UploadSessionStatus;
  statistics: {
    current: number;
    completed: number;
    total: number;
    error: number;
  };
}

const buildForm = (fields: object, file: File) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value as string);
  }
  formData.append(
    'Content-Type',
    file.type ? file.type : 'application/octet-stream',
  );
  formData.append('file', file);
  return formData;
}

const isOutOfStorageMessage = (response: BaseResponse) => (
  response.messageIncludesPhrase('no_space_left')
);

@Injectable()
export class Uploader {
  public progress: EventEmitter<UploadProgressEvent> = new EventEmitter();

  constructor(
    private api: ApiService,
    private httpClient: HttpClient,
  ) {
  }

  private emitStart = (total: number) => this.progress.emit({
    sessionStatus: UploadSessionStatus.Start,
    statistics: {
      current: 0,
      completed: 0,
      total,
      error: 0,
    },
  });

  private emitProgress = (
    total: number,
    index: number,
    item: UploadItem,
  ) => this.progress.emit({
    item,
    sessionStatus: UploadSessionStatus.InProgress,
    statistics: {
      current: index + 1,
      completed: index + 1,
      total,
      error: 0,
    },
  });

  private emitError = (
    total: number,
    index: number,
    error: UploadSessionStatus,
    item: UploadItem,
  ) => this.progress.emit({
    item,
    sessionStatus: error,
    statistics: {
      current: index + 1,
      completed: index,
      total,
      error: 1,
    },
  });

  private emitFinish = (total: number) => this.progress.emit({
    sessionStatus: UploadSessionStatus.Done,
    statistics: {
      current: total,
      completed: total,
      total,
      error: 0,
    },
  });

  private getUploadData = async (item: UploadItem) => {
    const response = await this.api.record.getPresignedUrl(
      item.RecordVO,
      item.file.type ? item.file.type : 'application/octet-stream',
    );
    if (response.isSuccessful !== true) {
      throw response;
    }
    return response.getSimpleVO().value;
  };

  private registerRecord = async (item: UploadItem, destinationUrl: string) => {
    const registerResponse = await this.api.record.registerRecord(
      item.RecordVO,
      destinationUrl,
    );
    if (registerResponse.isSuccessful !== true) {
      throw registerResponse;
    }
    return registerResponse;
  }

  private upload = async (
    item: UploadItem,
    emitUploadProgress: (e: HttpEvent<any>) => void,
  ) => {
    const { destinationUrl, presignedPost } = await this.getUploadData(item);

    await this.httpClient.post(
      presignedPost.url,
      buildForm(presignedPost.fields, item.file),
      {
        observe: 'events',
        reportProgress: true,
        responseType: 'json',
        withCredentials: false,
      },
    ).forEach(emitUploadProgress);

    return this.registerRecord(item, destinationUrl);
  };

  async directS3Upload(parentFolder: FolderVO, files: File[]): Promise<any> {
    this.emitStart(files.length);

    for (let index = 0; index < files.length; index++) {
      const item = new UploadItem(files[index], parentFolder);

      const emitUploadProgress = (e: HttpEvent<any>) => {
        if (e.type === HttpEventType.UploadProgress) {
          item.transferProgress = e.loaded / e.total;
        } else if (e.type === HttpEventType.Response) {
          item.transferProgress = 1;
        }
        this.emitProgress(files.length, index, item);
      };

      try {
          await this.upload(item, emitUploadProgress);
      } catch (err: unknown) {
        item.uploadStatus = UploadStatus.Cancelled;
        if (err instanceof BaseResponse && isOutOfStorageMessage(err)) {
          this.emitError(
            files.length,
            index,
            UploadSessionStatus.StorageError,
            item,
          );
        } else {
          this.emitError(
            files.length,
            index,
            UploadSessionStatus.ConnectionError,
            item,
          );
        }
        throw err;
      }

      item.uploadStatus = UploadStatus.Done;
      this.emitProgress(files.length, index, item);
    }

    this.emitFinish(files.length);

    return Promise.resolve();
  }
}
