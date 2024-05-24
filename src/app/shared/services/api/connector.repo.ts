/* @format */
import {
  AccountVO,
  AccountPasswordVO,
  ArchiveVO,
  AuthVO,
  ConnectorOverviewVO,
  SimpleVO,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class ConnectorRepo extends BaseRepo {
  public getOverview(
    connectors: ConnectorOverviewVO[]
  ): Observable<ConnectorResponse> {
    return this.http.sendRequest<ConnectorResponse>(
      '/connector/getOverview',
      connectors,
      { responseClass: ConnectorResponse }
    );
  }

  public familysearchConnect(archive: ArchiveVO) {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequest<ConnectorResponse>(
      '/connector/familysearchSetup',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public familysearchAuthorize(archive: ArchiveVO, code: string) {
    const simpleVo = new SimpleVO({
      key: 'oauthCode',
      value: code,
    });

    const data = [
      {
        ArchiveVO: archive,
        SimpleVO: simpleVo,
      },
    ];

    return this.http.sendRequestPromise<ConnectorResponse>(
      `/connector/familysearchAuthorize`,
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public familysearchDisconnect(archive: ArchiveVO) {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequest<ConnectorResponse>(
      '/connector/familysearchDisconnect',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public getFamilysearchUser(archive: ArchiveVO): Promise<any> {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ConnectorResponse>(
      '/connector/getFamilysearchUser',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public getFamilysearchTreeUser(archive: ArchiveVO): Promise<any> {
    const data = [
      {
        ArchiveVO: archive,
      },
    ];

    return this.http.sendRequestPromise<ConnectorResponse>(
      '/connector/getFamilysearchTreeUser',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public getFamilysearchAncestry(
    archive: ArchiveVO,
    personId: string
  ): Promise<any> {
    const data = [
      {
        ArchiveVO: archive,
        SimpleVO: new SimpleVO({ key: 'personId', value: personId }),
      },
    ];

    return this.http.sendRequestPromise<ConnectorResponse>(
      '/connector/getFamilysearchAncestry',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public getFamilysearchMemories(
    archive: ArchiveVO,
    personId: string
  ): Promise<any> {
    const data = [
      {
        ArchiveVO: archive,
        SimpleVO: new SimpleVO({ key: 'personId', value: personId }),
      },
    ];

    return this.http.sendRequestPromise<ConnectorResponse>(
      '/connector/getFamilysearchMemories',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public familysearchMemoryImportRequest(
    archive: ArchiveVO | ArchiveVO[],
    personId?: string | string[]
  ): Promise<any> {
    if (!Array.isArray(archive)) {
      archive = [archive];
    }

    if (personId && !Array.isArray(personId)) {
      personId = [personId];
    }

    let data;

    if (personId) {
      data = archive.map((vo, i) => {
        return {
          ArchiveVO: vo,
          SimpleVO: new SimpleVO({ key: 'personId', value: personId[i] }),
        };
      });
    } else {
      data = archive.map((vo, i) => {
        return {
          ArchiveVO: vo,
        };
      });
    }

    return this.http.sendRequestPromise<ConnectorResponse>(
      '/connector/familysearchMemoryImportRequest',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public familysearchMemorySyncRequest(
    archive: ArchiveVO | ArchiveVO[]
  ): Promise<any> {
    if (!Array.isArray(archive)) {
      archive = [archive];
    }

    const data = archive.map((vo) => {
      return {
        ArchiveVO: vo,
      };
    });

    return this.http.sendRequestPromise<ConnectorResponse>(
      '/connector/familysearchMemorySyncRequest',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public familysearchMemoryUploadRequest(
    archive: ArchiveVO | ArchiveVO[]
  ): Promise<any> {
    if (!Array.isArray(archive)) {
      archive = [archive];
    }

    const data = archive.map((vo) => {
      return {
        ArchiveVO: vo,
      };
    });

    return this.http.sendRequestPromise<ConnectorResponse>(
      '/connector/familysearchMemoryUploadRequest',
      data,
      { responseClass: ConnectorResponse }
    );
  }

  public familysearchFactImportRequest(
    archive: ArchiveVO | ArchiveVO[],
    personId: string | string[]
  ): Promise<any> {
    if (!Array.isArray(archive)) {
      archive = [archive];
    }

    if (!Array.isArray(personId)) {
      personId = [personId];
    }

    const data = archive.map((vo, i) => {
      return {
        ArchiveVO: vo,
        SimpleVO: new SimpleVO({ key: 'personId', value: personId[i] }),
      };
    });

    return this.http.sendRequestPromise<ConnectorResponse>(
      '/connector/familysearchFactImportRequest',
      data,
      { responseClass: ConnectorResponse }
    );
  }
}

export class ConnectorResponse extends BaseResponse {
  public getConnectorOverviewVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return new ConnectorOverviewVO(data[0][0].ConnectorOverviewVO);
  }

  public getConnectorOverviewVOs() {
    const data = this.getResultsData();

    return data.map((result) => {
      return new ConnectorOverviewVO(result[0].ConnectorOverviewVO);
    });
  }
}
