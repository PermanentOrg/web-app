import { RecordVO, FolderVO, RecordVOData, SimpleVO } from '@root/app/models';
import { BaseResponse, BaseRepo, LeanWhitelist } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';


import { StorageService } from '@shared/services/storage/storage.service';
import { ThumbnailCache } from '@shared/utilities/thumbnail-cache/thumbnail-cache';

const MIN_WHITELIST: (keyof RecordVO)[] = ['recordId', 'archiveNbr', 'folder_linkId'];
const DEFAULT_WHITELIST: (keyof RecordVO)[] = [...MIN_WHITELIST, 'displayName', 'description', 'displayDT'];

export class RecordRepo extends BaseRepo {
  public get(recordVOs: RecordVO[]): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO({
          folder_linkId: recordVO.folder_linkId,
          recordId: recordVO.recordId,
          archiveNbr: recordVO.archiveNbr
        })
      };
    });

    return this.http.sendRequestPromise<RecordResponse>('/record/get', data, RecordResponse);
  }

  public getLean(recordVOs: RecordVO[], whitelist ?: string[]): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      const newVO = new RecordVO(recordVO);
      newVO.dataWhitelist = whitelist || LeanWhitelist;
      return {
        RecordVO: newVO
      };
    });

    return this.http.sendRequestPromise<RecordResponse>('/record/getLean', data, RecordResponse);
  }

  public getPresignedUrl(recordVO: RecordVO, fileType: string): Promise<BaseResponse> {
    return this.http.sendRequestPromise(
      '/record/getPresignedUrl',
      [{
        RecordVO: recordVO,
        SimpleVO: {
          key: 'type',
          value: fileType,
        },
      }],
    );
  }

  public registerRecord(recordVO: RecordVO, s3url: string): Promise<RecordResponse> {
    return this.http.sendRequestPromise(
      '/record/registerRecord',
      {
        RecordVO: recordVO,
        SimpleVO: {
          key: 's3url',
          value: s3url,
        },
      },
    );
  }

  public update(recordVOs: RecordVO[], whitelist = DEFAULT_WHITELIST): Promise<RecordResponse> {
    if (whitelist !== DEFAULT_WHITELIST) {
      whitelist = [...whitelist, ...MIN_WHITELIST];
    }

    const data = recordVOs.map((vo) => {
      const updateData: RecordVOData = {};
      for (const prop of whitelist) {
        if (vo[prop] !== undefined) {
          updateData[prop] = vo[prop];
        }
      }

      return {
        RecordVO: new RecordVO(updateData)
      };
    });

    return this.http.sendRequestPromise<RecordResponse>('/record/update', data, RecordResponse);
  }

  public delete(recordVOs: RecordVO[]): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO(recordVO).getCleanVO()
      };
    });

    const cache = this.getThumbnailCache();
    for (const record of recordVOs) {
      if (record.parentFolder_linkId) {
        cache.invalidateFolder(record.parentFolder_linkId);
      }
    }

    return this.http.sendRequestPromise<RecordResponse>('/record/delete', data, RecordResponse);
  }

  public move(recordVOs: RecordVO[], destination: FolderVO): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO(recordVO).getCleanVO(),
        FolderDestVO: {
          folder_linkId: destination.folder_linkId
        }
      };
    });

    if (destination.folder_linkId) {
      this.getThumbnailCache().invalidateFolder(destination.folder_linkId);
    }

    return this.http.sendRequestPromise<RecordResponse>('/record/move', data, RecordResponse);
  }

  public copy(recordVOs: RecordVO[], destination: FolderVO): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO(recordVO).getCleanVO(),
        FolderDestVO: {
          folder_linkId: destination.folder_linkId
        }
      };
    });

    if (destination.folder_linkId) {
      this.getThumbnailCache().invalidateFolder(destination.folder_linkId);
    }

    return this.http.sendRequestPromise<RecordResponse>('/record/copy', data, RecordResponse);
  }

  private getThumbnailCache(): ThumbnailCache {
    const storage = new StorageService();
    return new ThumbnailCache(storage);
  }
}

export class RecordResponse extends BaseResponse {
  public getRecordVO(initChildren?: boolean) {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new RecordVO(data[0][0].RecordVO, initChildren);
  }

  public getRecordVOs(initChildren?: boolean) {
    const data = this.getResultsData();

    return data.map((result) => {
      return new RecordVO(result[0].RecordVO, initChildren);
    });
  }
}
