import { AccountVO, AccountPasswordVO, ArchiveVO, AuthVO, ConnectorOverviewVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class ConnectorRepo extends BaseRepo {
  public getOverview(connectors: ConnectorOverviewVO[]): Observable<ConnectorResponse> {
    return this.http.sendRequest('/connector/getOverview', connectors, ConnectorResponse);
  }

  public facebookConnect(archive: ArchiveVO) {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequest('/connector/facebookSetup', data, ConnectorResponse);
  }

  public facebookDisconnect(archive: ArchiveVO) {
    const data = [{
      ArchiveVO: archive
    }];

    return this.http.sendRequest('/connector/facebookDisconnect', data, ConnectorResponse);
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
