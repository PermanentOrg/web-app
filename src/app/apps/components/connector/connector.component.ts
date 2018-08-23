import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { ApiService } from '@shared/services/api/api.service';

import { ConnectorOverviewVO, FolderVO, SimpleVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { ConnectorResponse } from '@shared/services/api/index.repo';

@Component({
  selector: 'pr-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss']
})
export class ConnectorComponent implements OnInit {
  @Input() connector: ConnectorOverviewVO;
  @Input() appsFolder: FolderVO;

  public connected: boolean;
  public folder: FolderVO;
  public hasFiles: boolean;
  public connectorName: string;

  public waiting: boolean;

  constructor(private router: Router, private prConstants: PrConstantsService, private api: ApiService, private account: AccountService) { }

  ngOnInit() {
    const type = this.connector.type.split('.').pop();
    this.folder = _.find(this.appsFolder.ChildItemVOs, {special: `${type}.root.folder`}) as FolderVO;
    if (this.folder) {
      this.hasFiles = this.folder.ChildItemVOs && this.folder.ChildItemVOs.length;
    }
    this.connectorName = this.prConstants.translate(this.connector.type);
    this.setStatus();
  }

  setStatus() {
    this.connected = this.connector.status === 'status.connector.connected';
  }

  goToFolder() {
    this.router.navigate(['/apps', this.folder.archiveNbr, this.folder.folder_linkId]);
  }

  connect() {
    let connectRequest: Observable<any>;
    const archive = this.account.getArchive();

    this.waiting = true;

    switch (this.connector.type) {
      case 'type.connector.facebook':
        connectRequest = this.api.connector.facebookConnect(archive);
    }

  if (connectRequest) {
      return connectRequest
        .pipe(map(((response: ConnectorResponse) => {
          this.waiting = false;
          if (!response.isSuccessful) {
            throw response;
          }

          return response.getSimpleVO();
        }))).toPromise()
        .then((result: SimpleVO) => {
          location.assign(result.value);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  disconnect() {
    let disconnectRequest: Observable<any>;
    const archive = this.account.getArchive();

    this.waiting = true;

    switch (this.connector.type) {
      case 'type.connector.facebook':
        disconnectRequest = this.api.connector.facebookDisconnect(archive);
    }

    if (disconnectRequest) {
      return disconnectRequest
        .pipe(map(((response: ConnectorResponse) => {
          this.waiting = false;
          if (!response.isSuccessful) {
            throw response;
          }

          return response.getConnectorOverviewVO();
        }))).toPromise()
        .then((connector: ConnectorOverviewVO) => {
          this.connector = connector;
          this.setStatus();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

}
