/* @format */
import { FolderVO, FolderVOData, ItemVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataStatus } from '@models/data-status.enum';
import { head, result } from 'lodash';

const MIN_WHITELIST: (keyof FolderVO)[] = [
  'folderId',
  'archiveNbr',
  'folder_linkId',
];
const DEFAULT_WHITELIST: (keyof FolderVO)[] = [
  ...MIN_WHITELIST,
  'displayName',
  'description',
  'displayDT',
  'displayEndDT',
  'view',
];

export class FolderRepo extends BaseRepo {
  public getRoot(): Promise<FolderResponse> {
    return this.http.sendRequestPromise<FolderResponse>('/folder/getRoot', [], {
      responseClass: FolderResponse,
    });
  }

  public async get(
    folderVOs: FolderVO[],
    isV2: boolean = false,
    headers: Record<string, any> = {},
  ): Promise<FolderResponse | FolderVO[]> {
    if (!isV2) {
      const data = folderVOs.map((folderVO) => {
        return {
          FolderVO: {
            archiveNbr: folderVO.archiveNbr,
            folder_linkId: folderVO.folder_linkId,
            folderId: folderVO.folderId,
          },
        };
      });

      return this.http.sendRequestPromise<FolderResponse>('/folder/get', data, {
        responseClass: FolderResponse,
      });
    } else {
      const folderIds = folderVOs.map((folder: FolderVO) => folder.folderId);

      const data = {
        folderIds,
      };

      return await firstValueFrom(
        this.httpV2.get('v2/folder', data, null, { headers }),
      );
    }
  }

  public getWithChildren(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: {
          archiveNbr: folderVO.archiveNbr,
          folder_linkId: folderVO.folder_linkId,
          folderId: folderVO.folderId,
        },
      };
    });

    return this.http.sendRequestPromise<FolderResponse>(
      '/folder/getWithChildren',
      data,
      { responseClass: FolderResponse },
    );
  }

  public navigate(folderVO: FolderVO): Observable<FolderResponse> {
    const response = {
      ...folderVO,
    };
    if (folderVO.type === 'type.folder.root.private') {
      response.displayName = 'Private';
    }

    const data = [
      {
        FolderVO: new FolderVO(response),
      },
    ];

    return this.http.sendRequest<FolderResponse>('/folder/navigateMin', data, {
      responseClass: FolderResponse,
    });
  }

  public navigateLean(folderVO: FolderVO): Observable<FolderResponse> {
    const data = [
      {
        FolderVO: new FolderVO(folderVO),
      },
    ];

    return this.http.sendRequest<FolderResponse>('/folder/navigateLean', data, {
      responseClass: FolderResponse,
    });
  }

  public getLeanItems(folderVOs: FolderVO[]): Observable<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO),
      };
    });

    return this.http.sendRequest<FolderResponse>('/folder/getLeanItems', data, {
      responseClass: FolderResponse,
    });
  }

  public post(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO),
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/post', data, {
      responseClass: FolderResponse,
    });
  }

  public update(
    folderVOs: FolderVO[],
    whitelist = DEFAULT_WHITELIST,
  ): Promise<FolderResponse> {
    if (whitelist !== DEFAULT_WHITELIST) {
      whitelist = [...whitelist, ...MIN_WHITELIST];
    }

    const data = folderVOs.map((vo) => {
      const updateData: FolderVOData = {};
      for (const prop of whitelist) {
        if (vo[prop] !== undefined) {
          updateData[prop] = vo[prop];
        }
      }

      return {
        FolderVO: new FolderVO(updateData),
      };
    });

    return this.http.sendRequestPromise<FolderResponse>(
      '/folder/update',
      data,
      { responseClass: FolderResponse },
    );
  }

  public updateRoot(
    folderVOs: FolderVO[],
    whitelist = DEFAULT_WHITELIST,
  ): Promise<FolderResponse> {
    if (whitelist !== DEFAULT_WHITELIST) {
      whitelist = [...whitelist, ...MIN_WHITELIST];
    }

    const data = folderVOs.map((vo) => {
      const updateData: FolderVOData = {};
      for (const prop of whitelist) {
        if (vo[prop] !== undefined) {
          updateData[prop] = vo[prop];
        }
      }

      return {
        FolderVO: new FolderVO(updateData),
      };
    });

    return this.http.sendRequestPromise<FolderResponse>(
      '/folder/updateRootColumns',
      data,
      { responseClass: FolderResponse },
    );
  }

  public delete(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO),
      };
    });

    return this.http.sendRequestPromise<FolderResponse>(
      '/folder/delete',
      data,
      { responseClass: FolderResponse },
    );
  }

  public move(
    folderVOs: FolderVO[],
    destination: FolderVO,
  ): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO),
        FolderDestVO: {
          folder_linkId: destination.folder_linkId,
        },
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/move', data, {
      responseClass: FolderResponse,
      useAuthorizationHeader: true,
    });
  }

  public copy(
    folderVOs: FolderVO[],
    destination: FolderVO,
  ): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO),
        FolderDestVO: {
          folder_linkId: destination.folder_linkId,
        },
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/copy', data, {
      responseClass: FolderResponse,
      useAuthorizationHeader: true,
    });
  }

  public getPublicRoot(archiveNbr: string) {
    const data = [
      {
        ArchiveVO: {
          archiveNbr,
        },
      },
    ];

    return this.http.sendRequestPromise<FolderResponse>(
      '/folder/getPublicRoot',
      data,
      { responseClass: FolderResponse },
    );
  }

  public sort(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO({
          folder_linkId: folderVO.folder_linkId,
          sort: folderVO.sort,
        }),
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/sort', data, {
      responseClass: FolderResponse,
    });
  }

  public createZip(items: ItemVO[]): Promise<FolderResponse> {
    const data = [
      {
        ZipVO: {
          items: items.map((i) => i.archiveNbr).join(','),
        },
      },
    ];

    return this.http.sendRequestPromise<FolderResponse>('/zip/post', data, {
      responseClass: FolderResponse,
    });
  }
}

export class FolderResponse extends BaseResponse {
  public getFolderVO(
    initChildren?: boolean,
    dataStatus: DataStatus = DataStatus.Placeholder,
  ) {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new FolderVO(data[0][0].FolderVO, initChildren, dataStatus);
  }

  public getFolderVOs(initChildren?: boolean) {
    const data = this.getResultsData();

    return data.map((result) => {
      return new FolderVO(result[0].FolderVO, initChildren);
    });
  }
}
