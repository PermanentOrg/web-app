import { FolderVO } from '@models/index';
import { BaseResponse, BaseRepo } from './base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class FolderRepo extends BaseRepo {
  public getRoot(): Observable<FolderResponse> {
    return this.http.sendRequest('/folder/getRoot', [], FolderResponse);
  }

  public get(folderVOs: FolderVO[]): Observable<FolderResponse> {
    const data = folderVOs.map((folderVO) => {
      return {
        FolderVO: new FolderVO(folderVO)
      };
    });

    return this.http.sendRequest('/folder/get', data, FolderResponse);
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
