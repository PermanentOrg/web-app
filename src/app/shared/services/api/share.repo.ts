import { FolderVO, ArchiveVO, ShareVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten, compact } from 'lodash';

export class ShareRepo extends BaseRepo {
  public getShares(): Promise<ShareResponse> {
    return this.http.sendRequestPromise('/share/getShares', [], ShareResponse);
  }

  public update(share: ShareVO) {
    const data = {
      ShareVO: share
    };

    return this.http.sendRequestPromise('/share/update', [data], ShareResponse);
  }

  public upsert(share: ShareVO) {
    const data = {
      ShareVO: share
    };

    return this.http.sendRequestPromise('/share/upsert', [data], ShareResponse);
  }

  public remove(share: ShareVO) {
    const data = {
      ShareVO: {
        shareId: share.shareId
      }
    };

    return this.http.sendRequestPromise('/share/delete', [data], ShareResponse);
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

    return compact(flatten(archives));
  }

  public getShareVO() {
    const data = this.getResultsData();
    if (!data || !data.length || !data[0]) {
      return null;
    }

    return new ShareVO(data[0][0].ShareVO);
  }
}
