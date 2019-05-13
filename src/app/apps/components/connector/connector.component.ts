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
import { MessageService } from '@shared/services/message/message.service';
import { PromptService, PromptButton } from '@core/services/prompt/prompt.service';
import { StorageService } from '@shared/services/storage/storage.service';

export enum ConnectorImportType {
  Everything,
  Tagged
}

export const FAMILYSEARCH_CONNECT_KEY = 'familysearchConnect';

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

  public connectedAccountName: string;

  constructor(
    private router: Router,
    private prConstants: PrConstantsService,
    private api: ApiService,
    private account: AccountService,
    private message: MessageService,
    private prompt: PromptService,
    private storage: StorageService
  ) { }

  ngOnInit() {
    const type = this.connector.type.split('.').pop();
    this.folder = _.find(this.appsFolder.ChildItemVOs, {special: `${type}.root.folder`}) as FolderVO;
    if (this.folder) {
      this.hasFiles = this.folder.ChildItemVOs && this.folder.ChildItemVOs.length;
    }
    this.connectorName = this.prConstants.translate(this.connector.type);
    this.setStatus();

    if (this.connected && type === 'familysearch') {
      this.api.connector.getFamilysearchUser(this.account.getArchive())
        .then(response => {
          const user = response.getResultsData()[0][0];
          this.connectedAccountName = user.displayName;
        });
    }
  }

  setStatus() {
    this.connected = this.connector.status === 'status.connector.connected';
  }

  goToFolder() {
    if (!this.hasFiles) {
      return;
    }

    this.router.navigate(['/apps', this.folder.archiveNbr, this.folder.folder_linkId]);
  }

  connect() {
    let connectRequest: Observable<any>;
    const archive = this.account.getArchive();

    this.waiting = true;

    switch (this.connector.type) {
      case 'type.connector.facebook':
        connectRequest = this.api.connector.facebookConnect(archive);
        break;
      case 'type.connector.familysearch':
        this.storage.local.set('familysearchConnect', true);
        connectRequest = this.api.connector.familysearchConnect(archive);
        break;
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
        .catch((response: ConnectorResponse) => {
          this.message.showError(response.getMessage(), true);
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
        break;
      case 'type.connector.familysearch':
        disconnectRequest = this.api.connector.familysearchDisconnect(archive);
        break;
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
        .catch((response: ConnectorResponse) => {
          this.message.showError(response.getMessage(), true);
        });
    }
  }

  authorize(code: string) {
    let connectRequest: Observable<any>;
    const archive = this.account.getArchive();

    this.waiting = true;

    switch (this.connector.type) {
      case 'type.connector.familysearch':
        connectRequest = this.api.connector.familysearchAuthorize(archive, code);
        break;
    }

  if (connectRequest) {
      return connectRequest
        .pipe(map(((response: ConnectorResponse) => {
          this.waiting = false;
          if (!response.isSuccessful) {
            throw response;
          }

          return response.getConnectorOverviewVO();
        }))).toPromise()
        .then((connector: ConnectorOverviewVO) => {
          this.connector = connector;
          console.log('authorized?', connector);
        })
        .catch((response: ConnectorResponse) => {
          this.message.showError(response.getMessage(), true);
        });
    }
  }

  importPrompt() {
    let buttons: PromptButton[] = [];
    let title: string;

    let importStartResolve;

    switch (this.connector.type) {
      case 'type.connector.facebook':
        buttons = [
          {
            buttonName: 'tagged',
            buttonText: '#permanent',
            value: ConnectorImportType.Tagged
          },
          {
            buttonName: 'everything',
            buttonText: 'Everything',
            value: ConnectorImportType.Everything
          }
        ];
        title = 'Import Facebook Photos';
        break;
    }

    const importStartPromise = new Promise((resolve, reject) => {
      importStartResolve = resolve;
    });

    if (!buttons.length) {
      this.import();
    } else {
      this.prompt.promptButtons(buttons, title, importStartPromise)
        .then((value) => {
          return this.import(value);
        })
        .then(() => {
          importStartResolve();
        })
        .catch(() => {
          importStartResolve();
        });
    }

  }

  import(importType: ConnectorImportType = ConnectorImportType.Everything) {
    let importRequest: Observable<any>;
    const archive = this.account.getArchive();


    this.waiting = true;

    switch (this.connector.type) {
      case 'type.connector.facebook':
        if (importType === ConnectorImportType.Tagged) {
          importRequest = this.api.connector.facebookTaggedImport(archive);
        } else {
          importRequest = this.api.connector.facebookBulkImport(archive);
        }
        break;
    }

    if (importRequest) {
      return importRequest
        .pipe(map(((response: ConnectorResponse) => {
          this.waiting = false;
          if (!response.isSuccessful) {
            throw response;
          }

          return response;
        }))).toPromise()
        .then(() => {
          this.message.showMessage('Facebook import started - we\'ll send an email when it\'s complete.', 'success');
        })
        .catch((response: ConnectorResponse) => {
          this.message.showError(response.getMessage(), true);
        });
    }
  }

}
