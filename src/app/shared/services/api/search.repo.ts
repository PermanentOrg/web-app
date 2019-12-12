import { ArchiveVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';
import { Observable } from 'rxjs';

export class SearchRepo extends BaseRepo {
  public archiveByEmail(email: string): Promise<SearchResponse> {
    const data = [{
      SearchVO: {
        query: email
      }
    }];

    return this.http.sendRequestPromise('/search/archiveByEmail', data, SearchResponse);
  }

  public archiveByName(query: string): Promise<SearchResponse> {
    const data = [{
      SearchVO: {
        query
      }
    }];

    return this.http.sendRequestPromise('/search/archive', data, SearchResponse);
  }

  public archiveByNameObservable(query: string): Observable<SearchResponse> {
    const data = [{
      SearchVO: {
        query
      }
    }];

    return this.http.sendRequest('/search/archive', data, SearchResponse);
  }
}

export class SearchResponse extends BaseResponse {
  public getArchiveVOs() {
    const data = this.getResultsData();

    if (!data || !data.length) {
      return [];
    }

    const archives = data.map((result) => {
      return result.map((resultList) => {
        return new ArchiveVO(resultList.ArchiveVO);
      });
    });

    return flatten(archives);
  }
}
