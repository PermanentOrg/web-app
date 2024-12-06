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
    tags: TagVOData[] = [],
    archiveId: string,
    limit?: number,
  ) {
    const endpoint = '/search/folderAndRecord';

    const tagsDict = tags.reduce((obj, tag, index) => {
      obj[`tags[${index}][tagId]`] = tag.tagId;
      return obj;
    }, {});

    console.log(tagsDict);

    let tagsQuery = '';

    Object.keys(tagsDict).forEach((key) => {
      tagsQuery += `&${key}=${tagsDict[key]}`;
    });

    const queryString =
      `query=${query}&archiveId=${archiveId}&publicOnly=true` +
      (limit ? `&numberOfResults=${limit}` : '') +
      (tagsQuery ? `${tagsQuery}` : '');

    return getFirst(
      this.httpV2.get<SearchResponse>(`${endpoint}?${queryString}`, {}, null, {
        authToken: false,
      }),
    );
  }

  public getPublicArchiveTags(archiveId: string): Observable<TagVOData[]> {
    return this.httpV2.get(`v2/archive/${archiveId}/tags/public`);
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
