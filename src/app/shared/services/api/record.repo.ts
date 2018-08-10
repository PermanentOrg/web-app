import { RecordVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class RecordRepo extends BaseRepo {
  public get(recordVOs: RecordVO[]): Observable<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: new RecordVO(recordVO)
      };
    });

    return this.http.sendRequest('/record/get', data, RecordResponse);
  }

  public postMeta(recordVOs: RecordVO[]): Observable<RecordResponse> {
    const data = recordVOs.map((recordVO) => {
      return {
        RecordVO: recordVO
      };
    });

    return this.http.sendRequest('/record/postMetaBatch', data, RecordResponse);
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
