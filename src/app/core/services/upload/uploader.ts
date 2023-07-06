/* @format */
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiService } from '@shared/services/api/api.service';

import { UploadItem } from './uploadItem';

const buildForm = (fields: object, file: File) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value as string);
  }
  formData.append(
    'Content-Type',
    file.type ? file.type : 'application/octet-stream'
  );
  formData.append('file', file);
  return formData;
};

@Injectable()
export class Uploader {
  constructor(private api: ApiService, private httpClient: HttpClient) {}

  private getUploadData = async (item: UploadItem) => {
    const response = await this.api.record.getPresignedUrl(
      item.RecordVO,
      item.file.type ? item.file.type : 'application/octet-stream'
    );
    if (response.isSuccessful !== true) {
      throw response;
    }
    return response.getSimpleVO().value;
  };

  private registerRecord = async (item: UploadItem, destinationUrl: string) => {
    const registerResponse = await this.api.record.registerRecord(
      item.RecordVO,
      destinationUrl
    );
    if (registerResponse.isSuccessful !== true) {
      throw registerResponse;
    }
    return registerResponse;
  };

  private upload = async (
    item: UploadItem,
    emitUploadProgress: (e: HttpEvent<any>) => void
  ) => {
    const { destinationUrl, presignedPost } = await this.getUploadData(item);

    await this.httpClient
      .post(presignedPost.url, buildForm(presignedPost.fields, item.file), {
        observe: 'events',
        reportProgress: true,
        responseType: 'json',
        withCredentials: false,
      })
      .forEach(emitUploadProgress);

    return this.registerRecord(item, destinationUrl);
  };

  private uploadMultipart = async (
    item: UploadItem,
    emitProgress: (n: number) => void
  ) => {
    const tenMB = 10 * 1024 * 1024;
    const { urls, uploadId, key } =
      await this.api.record.getMultipartUploadURLs(item.file.size);
    let filePointer = 0;
    const size = item.file.size;
    const eTags = [];
    for (const url of urls) {
      const response = await this.httpClient
        .put(url, item.file.slice(filePointer, filePointer + tenMB), {
          headers: {
            'Content-Type': item.file.type || 'application/octet-stream',
          },
          observe: 'response',
          reportProgress: true,
          responseType: 'json',
          withCredentials: false,
        })
        .toPromise();
      const etag = response.headers.get('etag').replace(/^"(.+?)"$/, '$1');
      const index = Math.floor(filePointer / tenMB);
      eTags[index] = etag;
      filePointer += tenMB;
      const progress = Math.min(filePointer / size, 1);
      emitProgress(progress);
    }

    return this.api.record.registerMultipartRecord(
      item.RecordVO,
      uploadId,
      key,
      eTags
    );
  };

  async uploadFile(
    item: UploadItem,
    emitUploadProgress: (e: number) => void
  ): Promise<any> {
    const multiPartSize = 5 * 1024 * 1024 * 1024; // Five GB
    emitUploadProgress(0);

    const httpProgress = (e: HttpEvent<any>) => {
      if (e.type === HttpEventType.UploadProgress) {
        emitUploadProgress(e.loaded / e.total);
      }
    };

    if (item.file.size > multiPartSize) {
      await this.uploadMultipart(item, emitUploadProgress);
    } else {
      await this.upload(item, httpProgress);
    }

    emitUploadProgress(1);

    return Promise.resolve();
  }
}
