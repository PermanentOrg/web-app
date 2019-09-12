import { FolderVO, ArchiveVO, ShareVO, RecordVO, ShareByUrlVO } from '@root/app/models';
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

  public generateShareLink(item: RecordVO | FolderVO): Promise<ShareResponse> {
    const data: any = {};

    if (item.isRecord) {
      data.RecordVO = {
        folder_linkId: item.folder_linkId
      };
    } else {
      data.FolderVO = {
        folder_linkId: item.folder_linkId
      };
    }

    return this.http.sendRequestPromise('/share/generateShareLink', [data], ShareResponse);
  }

  public getShareLink(item: RecordVO | FolderVO) {
    const data: any = {};

    if (item.isRecord) {
      data.RecordVO = {
        folder_linkId: item.folder_linkId
      };
    } else {
      data.FolderVO = {
        folder_linkId: item.folder_linkId
      };
    }

    return this.http.sendRequestPromise('/share/getLink', [data], ShareResponse);
  }

  public checkShareLink(urlToken: string) {
    const data = {
      Shareby_urlVO: {
        urlToken
      }
    };

    return this.http.sendRequestPromise('/share/checkShareLink', [data], ShareResponse);
  }

  public requestShareAccess(urlToken: string) {
    const data = {
      Shareby_urlVO: {
        urlToken
      }
    };

    return this.http.sendRequestPromise('/share/requestShareAccess', [data], ShareResponse);
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

  public getShareByUrlVO() {
    const data = this.getResultsData();
    if (!data || !data.length || !data[0] || !data[0][0].Shareby_urlVO || !data[0][0].Shareby_urlVO.shareUrl) {
      return null;
    }

    return new ShareByUrlVO(data[0][0].Shareby_urlVO);
  }
}
