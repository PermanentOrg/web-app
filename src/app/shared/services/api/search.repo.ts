import { ArchiveVO, RecordVO, FolderVO, ItemVO, TagVOData } from '@root/app/models';
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

    return this.http.sendRequestPromise<SearchResponse>('/search/archiveByEmail', data, SearchResponse);
  }

  public archiveByName(query: string): Promise<SearchResponse> {
    const data = [{
      SearchVO: {
        query
      }
    }];

    return this.http.sendRequestPromise<SearchResponse>('/search/archive', data, SearchResponse);
  }

  public archiveByNameObservable(query: string): Observable<SearchResponse> {
    const data = [{
      SearchVO: {
        query
      }
    }];

    return this.http.sendRequest<SearchResponse>('/search/archive', data, SearchResponse);
  }

  public recordByNameObservable(query: string, limit?: number): Observable<SearchResponse> {
    const data = [{
      SearchVO: {
        query,
        numberOfResults: limit
      }
    }];

    return this.http.sendRequest<SearchResponse>('/search/record', data, SearchResponse);
  }

  public itemsByNameObservable(query: string, tags: TagVOData[] = [], limit?: number): Observable<SearchResponse> {
    const data = {
      SearchVO: {
        query,
        TagVOs: tags,
        numberOfResults: limit
      }
    };

    return this.http.sendRequest<SearchResponse>('/search/folderAndRecord', [data], SearchResponse);
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

  public getItemVOs(initChildren?: boolean): ItemVO[] {
    const data = this.getResultsData();

    if (!data.length) {
      return [];
    }

    const searchVO = data[0][0].SearchVO;

    return searchVO.ChildItemVOs.map(i => {
      if (i.recordId) {
        return new RecordVO(i, initChildren);
      } else {
        return new FolderVO(i, initChildren);
      }
    });
  }

  public getRecordVOs(initChildren?: boolean) {
    const data = this.getResultsData();

    if (!data.length) {
      return [];
    }

    return data[0].map((result) => {
      return new RecordVO(result.RecordVO, initChildren);
    });
  }
}
