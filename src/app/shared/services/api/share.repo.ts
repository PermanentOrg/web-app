import { FolderVO, ArchiveVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';

export class ShareRepo extends BaseRepo {
  public getShares(): Promise<ShareResponse> {
    return this.http.sendRequestPromise('/share/getShares', [], ShareResponse);
  }
}

export class ShareResponse extends BaseResponse {
  public getShareArchiveVOs() {
    const data = this.getResultsData();
    const archives = data.map((result) => {
      if (!result) {
        return null;
      }

      return result.map((resultList) => {
        return new ArchiveVO(resultList.ArchiveVO);
      });
    });

    return flatten(archives);
  }
}
