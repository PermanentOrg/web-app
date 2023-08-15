/* @format */
import {
  AccountVO,
  AccountPasswordVO,
  ArchiveVO,
  AuthVO,
  AccountStorage,
  TagVOData,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { flatten, isArray } from 'lodash';
import { ProfileItemVOData } from '@models/profile-item-vo';
import { getFirst } from '../http-v2/http-v2.service';

export class ArchiveRepo extends BaseRepo {
  public get(archives: ArchiveVO[]): Promise<ArchiveResponse> {
    const data = archives.map((archive) => {
      return {
        ArchiveVO: new ArchiveVO({
          archiveNbr: archive.archiveNbr,
          archiveId: archive.archiveId,
        }),
      };
    });

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/get',
      data,
      ArchiveResponse
    );
  }

  public getAllArchives(accountVO: AccountVO): Promise<ArchiveResponse> {
    const data = [
      {
        AccountVO: {
          accountId: accountVO.accountId,
        },
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/getAllArchives',
      data,
      ArchiveResponse
    );
  }

  public change(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/change',
      data,
      ArchiveResponse
    );
  }

  public update(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/update',
      data,
      ArchiveResponse
    );
  }

  public delete(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/delete',
      data,
      ArchiveResponse
    );
  }

  public create(archive: ArchiveVO | ArchiveVO[]): Promise<ArchiveResponse> {
    if (!isArray(archive)) {
      archive = [archive];
    }

    const data = archive.map((archiveVo) => {
      return { ArchiveVO: archiveVo };
    });

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/post',
      data,
      ArchiveResponse
    );
  }

  public accept(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/accept',
      data,
      ArchiveResponse
    );
  }

  public decline(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/decline',
      data,
      ArchiveResponse
    );
  }

  public getMembers(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/getShares',
      data,
      ArchiveResponse
    );
  }

  public addMember(
    member: AccountVO,
    archive: ArchiveVO
  ): Promise<ArchiveResponse> {
    const data = [
      {
        AccountVO: member,
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/share',
      data,
      ArchiveResponse
    );
  }

  public transferOwnership(
    member: AccountVO,
    archive: ArchiveVO
  ): Promise<ArchiveResponse> {
    const data = [
      {
        AccountVO: member,
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/transferOwnership',
      data,
      ArchiveResponse
    );
  }

  public updateMember(
    member: AccountVO,
    archive: ArchiveVO
  ): Promise<ArchiveResponse> {
    const data = [
      {
        AccountVO: member,
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise(
      '/archive/updateShare',
      data,
      ArchiveResponse
    );
  }

  public removeMember(
    member: AccountVO,
    archive: ArchiveVO
  ): Promise<ArchiveResponse> {
    const data = [
      {
        AccountVO: member,
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/archive/unshare',
      data,
      ArchiveResponse
    );
  }

  public getAllProfileItems(archive: ArchiveVO): Promise<ArchiveResponse> {
    const data = [
      {
        Profile_itemVO: {
          archiveId: archive.archiveId,
          archiveNbr: archive.archiveNbr,
        },
      },
    ];

    const endpoint = archive?.archiveNbr
      ? '/profile_item/getAllByArchiveNbr'
      : '/profile_item/getAllByArchiveId';

    if (!archive?.archiveId && !archive?.archiveNbr) {
      return;
    }

    return this.http.sendRequestPromise<ArchiveResponse>(
      endpoint,
      data,
      ArchiveResponse
    );
  }

  public addUpdateProfileItems(profileItems: ProfileItemVOData[]) {
    const data = profileItems.map((i) => {
      return {
        Profile_itemVO: i,
      };
    });

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/profile_item/safeAddUpdate',
      data,
      ArchiveResponse
    );
  }

  public deleteProfileItem(profileItem: ProfileItemVOData) {
    const data = [
      {
        Profile_itemVO: profileItem,
      },
    ];

    return this.http.sendRequestPromise<ArchiveResponse>(
      '/profile_item/delete',
      data,
      ArchiveResponse
    );
  }

  public getArchiveStorage(archiveId) {
    return getFirst(
      this.httpV2.get<AccountStorage>(
        `v2/archive/${archiveId}/payer-account-storage`
      )
    ).toPromise();
  }

  public getPublicArchiveTags(archiveId: string) {
    return this.httpV2
      .get<TagVOData>(`v2/archive/${archiveId}/tags/public`)
      .toPromise();
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

  public getArchiveVOs(): ArchiveVO[] {
    const data = this.getResultsData();
    const archives = data.map((result) => {
      return result.map((resultList) => {
        return new ArchiveVO(resultList.ArchiveVO);
      });
    });

    return flatten(archives);
  }

  public getAccountVOs() {
    const data = this.getResultsData();
    const accounts = data.map((result) => {
      return result.map((resultList) => {
        return new AccountVO(resultList.AccountVO);
      });
    });

    return flatten(accounts);
  }

  public getProfileItemVOs() {
    const data = flatten(this.getResultsData());
    const profileItems = data.map((result) => {
      return result.Profile_itemVO;
    });

    return profileItems as ProfileItemVOData[];
  }
}
