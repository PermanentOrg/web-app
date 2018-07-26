import { FolderVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class FolderRepo extends BaseRepo {
  public getRoot(): Observable<FolderResponse> {
    return this.http.sendRequest('/folder/getRoot', [], FolderResponse);
  }

  public get(folderVOs: FolderVO[]): Observable<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: {
          archiveNbr: folderVO.archiveNbr,
          folder_linkId: folderVO.folder_linkId,
          folderId: folderVO.folderId
        }
      };
    });

    return this.http.sendRequest('/folder/get', data, FolderResponse);
  }

  public navigate(folderVO: FolderVO): Observable<FolderResponse> {
    const data = [{
      FolderVO: new FolderVO(folderVO)
    }];

    return this.http.sendRequest('/folder/navigateMin', data, FolderResponse);
  }

  public getLeanItems(folderVOs: FolderVO[]): Observable<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO)
      };
    });

    return this.http.sendRequest('/folder/getLeanItems', data, FolderResponse);
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
