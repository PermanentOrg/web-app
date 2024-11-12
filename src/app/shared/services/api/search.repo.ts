/* @format */
import {
  ArchiveVO,
  RecordVO,
  FolderVO,
  ItemVO,
  TagVOData,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';
import { Observable } from 'rxjs';
import { getFirst } from '../http-v2/http-v2.service';

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
      { responseClass: SearchResponse },
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

    return this.http.sendRequest<SearchResponse>('/search/archive', data, {
      responseClass: SearchResponse,
    });
  }

  public itemsByNameObservable(
    query: string,
    tags: any[] = [],
    limit?: number,
  ): Observable<SearchResponse> {
    const data = {
      SearchVO: {
        query,
        TagVOs: tags,
        numberOfResults: limit,
      },
    };

    return this.http.sendRequest<SearchResponse>(
      '/search/folderAndRecord',
      [data],
      { responseClass: SearchResponse },
    );
  }

  public itemsByNameInPublicArchiveObservable(
    query: string,
    tags: string[] = [],
    archiveId: string,
    limit?: number,
  ) {
    const jsonTags = JSON.stringify([
      {
        tagId: 2,
        name: 'asd',
        archiveId: 11,
        status: 'status.generic.ok',
        type: 'type.generic.placeholder',
        createdDT: '2024-07-03T11:55:57',
        updatedDT: '2024-11-11T13:09:54',
      },
    ]);

    console.log(jsonTags);
    const data = {
      query,
      tags: jsonTags,
      archiveId,
      publicOnly: true,
      numberOfResults: limit,
    };

    return getFirst(
      this.httpV2.get<SearchResponse>('/search/folderAndRecord', data, null, {
        authToken: false,
      }),
    );
  }
}

export class SearchResponse extends BaseResponse {
  public ChildItemVOs: ItemVO[];

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

    return searchVO.ChildItemVOs.map((i) => {
      if (i.recordId) {
        return new RecordVO(i);
      } else {
        return new FolderVO(i, initChildren);
      }
    });
  }

  public getRecordVOs() {
    const data = this.getResultsData();

    if (!data.length) {
      return [];
    }

    return data[0].map((result) => {
      return new RecordVO(result.RecordVO);
    });
  }
}
