import { AccountVO, AccountPasswordVO, ArchiveVO, AuthVO, ConnectorOverviewVO, SimpleVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

function isArray(obj: any) {
  return Array.isArray(obj);
}

export class ConnectorRepo extends BaseRepo {
  public getOverview(connectors: ConnectorOverviewVO[]): Observable<ConnectorResponse> {
    return this.http.sendRequest<ConnectorResponse>('/connector/getOverview', connectors, ConnectorResponse);
  }

  public facebookConnect(archive: ArchiveVO) {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequest<ConnectorResponse>('/connector/facebookSetup', data, ConnectorResponse);
  }

  public facebookDisconnect(archive: ArchiveVO) {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequest<ConnectorResponse>('/connector/facebookDisconnect', data, ConnectorResponse);
  }

  public facebookTaggedImport(archive: ArchiveVO) {
    const data = [{
      ArchiveVO: archive,
      ConnectorFacebookAlbumVO: {
        discardContent: false
      }
    }];

    return this.http.sendRequest<ConnectorResponse>('/connector/facebookRetrieveRequest', data, ConnectorResponse);
  }

  public facebookBulkImport(archive: ArchiveVO) {
    const data = [{
      ArchiveVO: archive,
      ConnectorFacebookAlbumVO: {
        discardContent: false
      }
    }];

    return this.http.sendRequest<ConnectorResponse>('/connector/uploadFacebookBulkImport', data, ConnectorResponse);
  }

  public familysearchConnect(archive: ArchiveVO) {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequest<ConnectorResponse>('/connector/familysearchSetup', data, ConnectorResponse);
  }

  public familysearchAuthorize(archive: ArchiveVO, code: string) {
    const simpleVo = new SimpleVO({
      key: 'oauthCode',
      value: code
    });

    const data = [{
      ArchiveVO: archive,
      SimpleVO: simpleVo
    }];

    return this.http.sendRequestPromise<ConnectorResponse>(`/connector/familysearchAuthorize`, data, ConnectorResponse);
  }

  public familysearchDisconnect(archive: ArchiveVO) {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequest<ConnectorResponse>('/connector/familysearchDisconnect', data, ConnectorResponse);
  }

  public getFamilysearchUser(archive: ArchiveVO): Promise<any> {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequestPromise<ConnectorResponse>('/connector/getFamilysearchUser', data, ConnectorResponse);
  }

  public getFamilysearchTreeUser(archive: ArchiveVO): Promise<any> {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequestPromise<ConnectorResponse>('/connector/getFamilysearchTreeUser', data, ConnectorResponse);
  }

  public getFamilysearchAncestry(archive: ArchiveVO, personId: string): Promise<any> {
    const data = [{
      ArchiveVO: archive,
      SimpleVO: new SimpleVO({key: 'personId', value: personId})
    }];

    return this.http.sendRequestPromise<ConnectorResponse>('/connector/getFamilysearchAncestry', data, ConnectorResponse);
  }

  public getFamilysearchMemories(archive: ArchiveVO, personId: string): Promise<any> {
    const data = [{
      ArchiveVO: archive,
      SimpleVO: new SimpleVO({key: 'personId', value: personId})
    }];

    return this.http.sendRequestPromise<ConnectorResponse>('/connector/getFamilysearchMemories', data, ConnectorResponse);
  }

  public familysearchMemoryImportRequest(archive: ArchiveVO | ArchiveVO[], personId?: string | string[]): Promise<any> {
    let archiveArray: ArchiveVO[];
    let personIdArray: string[];
    if (!isArray(archive)) {
      archiveArray = [ archive as ArchiveVO ];
    } else {
      archiveArray = archive as ArchiveVO[];
    }

    if (personId && !isArray(personId)) {
      personIdArray = [ personId as string ];
    } else {
      personIdArray = personId as string[];
    }

    let data;

    if (personIdArray) {
      data = archiveArray.map((vo, i) => {
        return {
          ArchiveVO: vo,
          SimpleVO: new SimpleVO({ key: 'personId', value: personIdArray[i] })
        };
      });
    } else {
      data = archiveArray.map((vo, i) => {
        return {
          ArchiveVO: vo
        };
      });
    }

    return this.http.sendRequestPromise<ConnectorResponse>('/connector/familysearchMemoryImportRequest', data, ConnectorResponse);
  }

  public familysearchMemorySyncRequest(archive: ArchiveVO | ArchiveVO[]): Promise<any> {
    let archiveArray: ArchiveVO[];
    if (!isArray(archive)) {
      archiveArray = [ archive as ArchiveVO ];
    } else {
      archiveArray = archive as ArchiveVO[];
    }

    const data = archiveArray.map(vo => {
      return {
        ArchiveVO: vo,
      };
    });

    return this.http.sendRequestPromise<ConnectorResponse>('/connector/familysearchMemorySyncRequest', data, ConnectorResponse);
  }

  public familysearchMemoryUploadRequest(archive: ArchiveVO | ArchiveVO[]): Promise<any> {
    let archiveArray: ArchiveVO[];
    if (!isArray(archive)) {
      archiveArray = [ archive as ArchiveVO ];
    } else {
      archiveArray = archive as ArchiveVO[];
    }

    const data = archiveArray.map(vo => {
      return {
        ArchiveVO: vo,
      };
    });

    return this.http.sendRequestPromise<ConnectorResponse>('/connector/familysearchMemoryUploadRequest', data, ConnectorResponse);
  }

  public familysearchFactImportRequest(archive: ArchiveVO | ArchiveVO[], personId: string | string[]): Promise<any> {
    let archiveArray: ArchiveVO[];
    let personIdArray: string[];
    if (!isArray(archive)) {
      archiveArray = [ archive as ArchiveVO ];
    } else {
      archiveArray = archive as ArchiveVO[];
    }

    if (personId && !isArray(personId)) {
      personIdArray = [ personId as string ];
    } else {
      personIdArray = personId as string[];
    }

    const data = archiveArray.map((vo, i) => {
      return {
        ArchiveVO: vo,
        SimpleVO: new SimpleVO({ key: 'personId', value: personId[i] })
      };
    });

    return this.http.sendRequestPromise<ConnectorResponse>('/connector/familysearchFactImportRequest', data, ConnectorResponse);
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
