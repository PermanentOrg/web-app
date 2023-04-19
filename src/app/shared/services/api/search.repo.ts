import { query } from '@angular/animations';
import { ArchiveVO, RecordVO, FolderVO, ItemVO, TagVOData } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';
import { Observable } from 'rxjs';

export class SearchRepo extends BaseRepo {
  public archiveByEmail(email: string): Observable<SearchResponse> {
    const data = [
      {
        SearchVO: {
          query: email,
        },
      },
    ];

    return this.http.sendRequest<SearchResponse>(
      '/search/archiveByEmail',
      data,
      SearchResponse
    );
  }

  public archiveByNameObservable(query: string): Observable<SearchResponse> {
    const data = [
      {
        SearchVO: {
          query,
        },
      },
    ];

    return this.http.sendRequest<SearchResponse>(
      '/search/archive',
      data,
      SearchResponse
    );
  }

  public itemsByNameObservable(
    query: string,
    tags: any[] = [],
    limit?: number
  ): Observable<SearchResponse> {
    const data = {
      SearchVO: {
      query,
      tags: tags,
      numberOfResults: limit,
      }
    };

    return this.http.sendV2Request<SearchResponse>(
      '/search/folderAndRecord',
      [data],
      SearchResponse
    );
  }

  public itemsByNameInPublicArchiveObservable(
    query: string,
    tags: any[] = [],
    archiveId: string,
    limit?: number,
  ): Observable<SearchResponse> {
    const data = {
      query,
      tags:'',
      archiveId,
      publicOnly:true
    };

    return this.http.getV2Request<SearchResponse>(
      '/search/folderAndRecord',
      data,
    );
  }
}

export class SearchResponse extends BaseResponse {
  public getArchiveVOs(): ArchiveVO[] {
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
