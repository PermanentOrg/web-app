import { AccountVO, AccountPasswordVO, ArchiveVO, AuthVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten } from 'lodash';
import { Observable } from 'rxjs';

export class ArchiveRepo extends BaseRepo {
  public get(archives: ArchiveVO[]): Promise<ArchiveResponse> {
    const data = archives.map((archive) => {
      return {
        ArchiveVO: new ArchiveVO({
          archiveNbr: archive.archiveNbr,
          archiveId: archive.archiveId
        })
      };
    });

    return this.http.sendRequestPromise('/archive/get', data, ArchiveResponse);
  }

  public getAllArchives(accountVO: AccountVO): Promise<ArchiveResponse> {
    const data = [{
      AccountVO: {
        accountId: accountVO.accountId
      }
    }];

    return this.http.sendRequestPromise('/archive/getAllArchives', data, ArchiveResponse);
  }

  public change(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequestPromise('/archive/change', data, ArchiveResponse);
  }

  public create(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequestPromise('/archive/post', data, ArchiveResponse);
  }

  public accept(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequestPromise('/archive/accept', data, ArchiveResponse);
  }
}

export class ArchiveResponse extends BaseResponse {
  public getArchiveVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new ArchiveVO(data[0][0].ArchiveVO);
  }

  public getArchiveVOs() {
    const data = this.getResultsData();
    const archives = data.map((result) => {
      return result.map((resultList) => {
        return resultList.ArchiveVO;
      });
    });

    return flatten(archives);
  }
}
