/* @format */
import { RecordVO, FolderVO, RecordVOData, SimpleVO } from '@root/app/models';
import {
  BaseResponse,
  BaseRepo,
  LeanWhitelist,
} from '@shared/services/api/base';

import { StorageService } from '@shared/services/storage/storage.service';
import { ThumbnailCache } from '@shared/utilities/thumbnail-cache/thumbnail-cache';
import { firstValueFrom } from 'rxjs';
import { getFirst } from '../http-v2/http-v2.service';

const MIN_WHITELIST: (keyof RecordVO)[] = [
  'recordId',
  'archiveNbr',
  'folder_linkId',
];
const DEFAULT_WHITELIST: (keyof RecordVO)[] = [
  ...MIN_WHITELIST,
  'displayName',
  'description',
  'displayDT',
];

class MultipartUploadUrlsList {
  public urls: string[] = [];
  public uploadId: string;
  public key: string;

  protected isInstance(obj: unknown): obj is MultipartUploadUrlsList {
    return (
      typeof obj === 'object' &&
      typeof obj['urls'] === 'object' &&
      typeof obj['urls'].length === 'number' &&
      typeof obj['uploadId'] === 'string' &&
      typeof obj['key'] === 'string'
    );
  }

  constructor(obj: unknown) {
    if (this.isInstance(obj)) {
      this.urls = obj.urls;
      this.uploadId = obj.uploadId;
      this.key = obj.key;
    }
  }
}

export class RecordRepo extends BaseRepo {
  public get(recordVOs: RecordVO[]): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO({
          folder_linkId: recordVO.folder_linkId,
          recordId: recordVO.recordId,
          archiveNbr: recordVO.archiveNbr,
        }),
      };
    });

    return this.http.sendRequestPromise<RecordResponse>('/record/get', data, {
      responseClass: RecordResponse,
    });
  }

  public getLean(
    recordVOs: RecordVO[],
    whitelist?: string[],
  ): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      const newVO = new RecordVO(recordVO);
      newVO.dataWhitelist = whitelist || LeanWhitelist;
      return {
        RecordVO: newVO,
      };
    });

    return this.http.sendRequestPromise<RecordResponse>(
      '/record/getLean',
      data,
      { responseClass: RecordResponse },
    );
  }

  public getPresignedUrl(
    recordVO: RecordVO,
    fileType: string,
  ): Promise<BaseResponse> {
    return this.http.sendRequestPromise('/record/getPresignedUrl', [
      {
        RecordVO: recordVO,
        SimpleVO: {
          key: 'type',
          value: fileType,
        },
      },
    ]);
  }

  public async registerRecord(
    recordVO: RecordVO,
    s3url: string,
  ): Promise<RecordVO> {
    return (
      await firstValueFrom(
        this.httpV2.post(
          '/record/registerRecord',
          {
            displayName: recordVO.displayName,
            parentFolderId: recordVO.parentFolderId,
            uploadFileName: recordVO.uploadFileName,
            size: recordVO.size,
            s3url,
          },
          RecordVO,
        ),
      )
    )[0];
  }

  public getMultipartUploadURLs(
    size: number,
  ): Promise<MultipartUploadUrlsList> {
    return getFirst(
      this.httpV2.post(
        '/record/getMultipartUploadUrls',
        {
          fileSizeInBytes: size,
        },
        MultipartUploadUrlsList,
      ),
    ).toPromise();
  }

  public async registerMultipartRecord(
    record: RecordVO,
    uploadId: string,
    key: string,
    eTags: string[],
  ): Promise<RecordResponse> {
    return getFirst(
      this.httpV2.post('/record/registerRecord', {
        displayName: record.displayName,
        parentFolderId: record.parentFolderId,
        uploadFileName: record.uploadFileName,
        size: record.size,
        multipartUploadData: {
          uploadId,
          key,
          parts: eTags.map((ETag, index) => ({
            PartNumber: index + 1,
            ETag,
          })),
        },
      }),
    ).toPromise() as unknown as RecordResponse;
  }

  public async update(recordVOs: RecordVO[], archiveId: number) {
    return await firstValueFrom(
      this.httpV2.post(
        '/record/update',
        this.prepareUpdateRecordRequest(recordVOs, archiveId),
        null,
      ),
    );
  }

  private prepareUpdateRecordRequest(recordVOs: RecordVO[], archiveId: number) {
    const record: any = Object.assign({}, recordVOs[0]);
    record.displayDt = record.displayDT;
    record.displayEndDt = record.displayEndDT;
    record.publicDt = record.publicDT;
    delete record.displayDT;
    delete record.displayEndDT;
    delete record.publicDT;
    return {
      ...record,
      archiveId,
    };
  }

  public delete(recordVOs: RecordVO[]): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO(recordVO).getCleanVO(),
      };
    });

    const cache = this.getThumbnailCache();
    for (const record of recordVOs) {
      if (record.parentFolder_linkId) {
        cache.invalidateFolder(record.parentFolder_linkId);
      }
    }

    return this.http.sendRequestPromise<RecordResponse>(
      '/record/delete',
      data,
      { responseClass: RecordResponse },
    );
  }

  public move(
    recordVOs: RecordVO[],
    destination: FolderVO,
  ): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO(recordVO).getCleanVO(),
        FolderDestVO: {
          folder_linkId: destination.folder_linkId,
        },
      };
    });

    if (destination.folder_linkId) {
      this.getThumbnailCache().invalidateFolder(destination.folder_linkId);
    }

    return this.http.sendRequestPromise<RecordResponse>('/record/move', data, {
      responseClass: RecordResponse,
      useAuthorizationHeader: true,
    });
  }

  public copy(
    recordVOs: RecordVO[],
    destination: FolderVO,
  ): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO(recordVO).getCleanVO(),
        FolderDestVO: {
          folder_linkId: destination.folder_linkId,
        },
      };
    });

    if (destination.folder_linkId) {
      this.getThumbnailCache().invalidateFolder(destination.folder_linkId);
    }

    return this.http.sendRequestPromise<RecordResponse>('/record/copy', data, {
      responseClass: RecordResponse,
      useAuthorizationHeader: true,
    });
  }

  private getThumbnailCache(): ThumbnailCache {
    const storage = new StorageService();
    return new ThumbnailCache(storage);
  }
}

export class RecordResponse extends BaseResponse {
  public getRecordVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new RecordVO(data[0][0].RecordVO);
  }

  public getRecordVOs() {
    const data = this.getResultsData();

    return data.map((result) => {
      return new RecordVO(result[0].RecordVO);
    });
  }
}
