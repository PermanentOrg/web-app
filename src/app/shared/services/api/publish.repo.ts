import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { FolderVO, RecordVO } from '@root/app/models';

export class PublishRepo extends BaseRepo {
  public getResource(urlToken: string): Promise<PublishResponse> {
    const data = [{
      PublishurlVO: {
        urltoken: urlToken
      }
    }];

    return this.http.sendRequestPromise('/publish/getResource', data, PublishResponse);
  }
}

export class PublishResponse extends BaseResponse {
  public getRecordVO(initChildren?: boolean) {
    const data = this.getResultsData();
    if (!data || !data.length || !data[0][0].RecordVO) {
      return null;
    }

    return new RecordVO(data[0][0].RecordVO, initChildren);
  }

  public getFolderVO(initChildren?: boolean) {
    const data = this.getResultsData();
    if (!data || !data.length || !data[0][0].FolderVO) {
      return null;
    }

    return  new FolderVO(data[0][0].FolderVO, initChildren);
  }
}
