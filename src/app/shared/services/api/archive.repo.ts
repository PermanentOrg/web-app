import { AccountVO, AccountPasswordVO, ArchiveVO, AuthVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';
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

  public change(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequestPromise('/archive/change', data, ArchiveResponse);
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
    const archives = data.map((result) => {
      return result.map((resultList) => {
        return resultList.ArchiveVO;
      });
    });

    return flatten(archives);
  }
}
