import { RecordVO, FolderVO } from '@root/app/models';
import { BaseResponse, BaseRepo, LeanWhitelist } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

    return this.http.sendRequestPromise('/record/get', data, RecordResponse);
  }

  public getLean(recordVOs: RecordVO[], whitelist ?: string[]): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      const newVO = new RecordVO(recordVO);
      newVO.dataWhitelist = whitelist || LeanWhitelist;
      return {
        RecordVO: newVO
      };
    });

    return this.http.sendRequestPromise('/record/getLean', data, RecordResponse);
  }

  public postMeta(recordVOs: RecordVO[]): Observable<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: recordVO
      };
    });

    return this.http.sendRequest('/record/postMetaBatch', data, RecordResponse);
  }

  public update(recordVOs: RecordVO[]): Promise<RecordResponse> {
    const data = recordVOs.map((vo) => {
      return {
        RecordVO: new RecordVO({
          recordId: vo.recordId,
          archiveNbr: vo.archiveNbr,
          displayName: vo.displayName
        })
      };
    });

    return this.http.sendRequestPromise('/record/update', data, RecordResponse);
  }

  public delete(recordVOs: RecordVO[]): Promise<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO(recordVO).getCleanVO()
      };
    });

    return this.http.sendRequestPromise('/record/delete', data, RecordResponse);
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

    return this.http.sendRequestPromise('/record/move', data, RecordResponse);
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

    return this.http.sendRequestPromise('/record/copy', data, RecordResponse);
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
