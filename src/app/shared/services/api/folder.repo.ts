import { FolderVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class FolderRepo extends BaseRepo {
  public getRoot(): Promise<FolderResponse> {
    return this.http.sendRequestPromise<FolderResponse>('/folder/getRoot', [], FolderResponse);
  }

  public get(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: {
          archiveNbr: folderVO.archiveNbr,
          folder_linkId: folderVO.folder_linkId,
          folderId: folderVO.folderId
        }
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/get', data, FolderResponse);
  }

  public getWithChildren(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: {
          archiveNbr: folderVO.archiveNbr,
          folder_linkId: folderVO.folder_linkId,
          folderId: folderVO.folderId
        }
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/getWithChildren', data, FolderResponse);
  }

  public navigate(folderVO: FolderVO): Observable<FolderResponse> {
    const data = [{
      FolderVO: new FolderVO(folderVO)
    }];

    return this.http.sendRequest<FolderResponse>('/folder/navigateMin', data, FolderResponse);
  }

  public navigateLean(folderVO: FolderVO): Observable<FolderResponse> {
    const data = [{
      FolderVO: new FolderVO(folderVO)
    }];

    return this.http.sendRequest<FolderResponse>('/folder/navigateLean', data, FolderResponse);
  }


  public getLeanItems(folderVOs: FolderVO[]): Observable<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO)
      };
    });

    return this.http.sendRequest<FolderResponse>('/folder/getLeanItems', data, FolderResponse);
  }

  public post(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO)
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/post', data, FolderResponse);
  }

  public update(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO)
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/update', data, FolderResponse);
  }

  public delete(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO)
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/delete', data, FolderResponse);
  }

  public move(folderVOs: FolderVO[], destination: FolderVO): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO),
        FolderDestVO: {
          folder_linkId: destination.folder_linkId
        }
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/move', data, FolderResponse);
  }

  public copy(folderVOs: FolderVO[], destination: FolderVO): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO),
        FolderDestVO: {
          folder_linkId: destination.folder_linkId
        }
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/copy', data, FolderResponse);
  }

  public getPublicRoot(archiveNbr: string) {
    const data = [{
      ArchiveVO: {
        archiveNbr
      }
    }];

    return this.http.sendRequestPromise<FolderResponse>('/folder/getPublicRoot', data, FolderResponse);
  }

  public sort(folderVOs: FolderVO[]): Promise<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO({
          folder_linkId: folderVO.folder_linkId,
          sort: folderVO.sort
        })
      };
    });

    return this.http.sendRequestPromise<FolderResponse>('/folder/sort', data, FolderResponse);
  }
}

export class FolderResponse extends BaseResponse {
  public getFolderVO(initChildren?: boolean) {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new FolderVO(data[0][0].FolderVO, initChildren);
  }

  public getFolderVOs(initChildren?: boolean) {
    const data = this.getResultsData();

    return data.map((result) => {
      return new FolderVO(result[0].FolderVO, initChildren);
    });
  }
}
