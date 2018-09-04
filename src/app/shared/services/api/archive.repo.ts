import { AccountVO, AccountPasswordVO, ArchiveVO, AuthVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class ArchiveRepo extends BaseRepo {
  public get(archiveIds: number[]): Observable<ArchiveResponse> {
    const data = archiveIds.map((archiveId) => {
      return {
        ArchiveVO: new ArchiveVO({archiveId: archiveId})
      };
    });

    return this.http.sendRequest('/archive/get', data, ArchiveResponse);
  }

  public getAllArchives(accountVO: AccountVO): Promise<ArchiveResponse> {
    const data = [{
      AccountVO: {
        accountId: accountVO.accountId
      }
    }];

    return this.http.sendRequestPromise('/archive/getAllArchives', data, ArchiveResponse);
  }
}

export class ArchiveResponse extends BaseResponse {
  public getArchiveVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new ArchiveVO(data[0][0].ArchiveVO);
  }

  public getArchiveVOs() {
    const data = this.getResultsData();

    return data.map((result) => {
      return new ArchiveVO(result[0].ArchiveVO);
    });
  }
}
