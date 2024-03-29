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
import { PromptService, PromptButton } from '@shared/services/prompt/prompt.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { Dialog } from '@root/app/dialog/dialog.service';
import { ConnectorType } from '@models/connector-overview-vo';
import { GuidedTourService } from '@shared/services/guided-tour/guided-tour.service';
import { CreateArchivesComplete, ImportFamilyTree } from '@shared/services/guided-tour/tours/familysearch.tour';
import { GuidedTourEvent } from '@shared/services/guided-tour/events';

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
  public connectorName: string;

  public waiting: boolean;

  public connectedAccountName: string;

  public connectText: string = null;

  constructor(
    private router: Router,
    private prConstants: PrConstantsService,
    private api: ApiService,
    private account: AccountService,
    private message: MessageService,
    private prompt: PromptService,
    private storage: StorageService,
    private dialog: Dialog,
    private guidedTour: GuidedTourService
  ) { }

  ngOnInit() {
    const type = this.connector.type.split('.').pop();
    this.folder = _.find(this.appsFolder.ChildItemVOs, {special: `${type}.root.folder`}) as FolderVO;
    this.connectorName = this.prConstants.translate(this.connector.type);
    this.setStatus();

    switch (type) {
      case 'familysearch':
        this.connectText = 'Sign In with FamilySearch';
        break;
    }
  }

  setStatus() {
    this.connected = this.connector.status === 'status.connector.connected';
  }

  getConnectorClass(type: ConnectorType) {
    switch (type) {
      case 'type.connector.facebook':
        return 'connector-facebook';
      case 'type.connector.familysearch':
        return 'connector-familysearch';
    }
  }

  async familysearchUploadRequest() {
    this.waiting = true;
    const archive = this.account.getArchive();
    try {
      const response = await this.api.connector.familysearchMemoryUploadRequest(archive);
      this.message.showMessage('FamilySearch memory upload started in background. This may take a few moments.', 'success');
    } catch (err) {
      if (err instanceof ConnectorResponse) {
        this.message.showError(err.getMessage());
      }
    } finally {
      this.waiting = false;
    }
  }

  async familysearchDownloadRequest() {
    this.waiting = true;
    const archive = this.account.getArchive();
    try {
      const response = await this.api.connector.familysearchMemoryImportRequest(archive);
      this.message.showMessage('FamilySearch memory download started in background. This may take a few moments.', 'success');
    } catch (err) {
      if (err instanceof ConnectorResponse) {
        this.message.showError(err.getMessage());
      }
    } finally {
      this.waiting = false;
    }
  }

  async familysearchSyncRequest() {
    this.waiting = true;
    const archive = this.account.getArchive();
    try {
      const response = await this.api.connector.familysearchMemorySyncRequest(archive);
      this.message.showMessage('FamilySearch sync started in background. This may take a few moments.', 'success');
    } catch (err) {
      if (err instanceof ConnectorResponse) {
        this.message.showError(err.getMessage());
      }
    } finally {
      this.waiting = false;
    }
  }

  async startFamilysearchTreeImport() {
    let generationsToImport = 4;

    try {
      const result = await this.prompt.prompt(
        [{
          fieldName: 'generations',
          placeholder: 'Number of generations',
          type: 'select',
          initialValue: generationsToImport.toString(),
          selectOptions: [1, 2, 3, 4, 5, 6, 7].map(i => {
            return { text: i, value: i.toString() };
          })
        }],
        'How many generations of ancestors would you like to import?'
      );

      generationsToImport = parseInt(result.generations, 10);
    } catch (err) {
      return;
    }

    const data = await this.getFamilysearchTreeData();

    if (!data) {
      return;
    }

    data.treeData = data.treeData.filter(i => parseInt(i.display.ascendancyNumber, 10) < Math.pow(2, generationsToImport + 1));

    try {
      await this.dialog.open('FamilySearchImportComponent', data);
    } catch (err) { }
  }

  async getFamilysearchTreeData() {
    this.waiting = true;

    try {
      const userResponse = await this.api.connector.getFamilysearchTreeUser(this.account.getArchive());
      const userResponseData = userResponse.getResultsData()[0][0];

      const treeResponse = await this.api.connector.getFamilysearchAncestry(this.account.getArchive(), userResponseData.id);
      this.waiting = false;

      const treeResponseData = treeResponse.getResultsData()[0][0];
      return { currentUserData: userResponseData, treeData: treeResponseData.persons };
    } catch (response) {
      this.waiting = false;
      this.connector.status = 'status.connector.disconnected';
      this.setStatus();
      this.message.showError(response.getMessage());
    }
  }

  showHelp() {
    let template: string;
    const familySearchHelp = `
    <p>This feature will import memories from persons you select
    in your family tree, then automatically create individual
    archives for each of those persons. You'll find those
    memories saved in the apps section of those person archives.</p>
    `;
    switch (this.connector.type) {
      case 'type.connector.facebook':
        template = `
        <p><strong>Why can't I connect to Facebook?</strong></p>
        <p>We have suspended our Facebook integration indefinitely.</p>
        `;
        break;
      case 'type.connector.familysearch':
        if (!this.connected) {
          template = `
          <p>Connect to your FamilySearch account with the <strong>Sign In with FamilySearch</strong> option.</p>
          ${familySearchHelp}
          `;
        } else {
          template = `
          <p>Create separate, private Permanent Archives from your existing FamilySearch family tree data using the <strong>Import Family Tree</strong> option.</p>
          ${familySearchHelp}
          `;
        }
        break;
    }

    const done: string = 'Learn More';

    try {
      this.prompt.confirm(
        done,
        this.prConstants.translate(this.connector.type),
        null,
        null,
        template
      ).then((val) => {
        if (this.isFacebook()) {
          window.open('https://www.permanent.org/blog/why-weve-chosen-to-suspend-our-facebook-integration/', '_blank');
        } else if (this.isFamilySearch()) {
          window.open('https://desk.zoho.com/portal/permanent/en/kb/articles/import-persons-memories-familysearch', '_blank');
        }
      }).catch(() => {
        // Do nothing on "Cancel" press, but still catch the promise rejection.
      });
    } catch (err) {
    }
  }

  goToFolder() {
    if (!this.folder) {
      return;
    }

    this.router.navigate(['/apps', this.folder.archiveNbr, this.folder.folder_linkId]);
  }

  getTooltip() {
    if (!this.folder) {
      return '';
    }

    switch (this.connector.type) {
      case 'type.connector.facebook':
        return 'View imported photos';
      case 'type.connector.familysearch':
        return 'View imported memories and add new memories to upload';
    }
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

  async authorize(code: string) {
    let connectRequest: Promise<ConnectorResponse>;
    const archive = this.account.getArchive();

    this.waiting = true;

    switch (this.connector.type) {
      case 'type.connector.familysearch':
        connectRequest = this.api.connector.familysearchAuthorize(archive, code);
        break;
    }

    if (connectRequest) {
      try {
        const response = await connectRequest;
        const connector = response.getConnectorOverviewVO();
        this.connector.update(connector);
        this.setStatus();
        this.router.navigate(["/apps"], { queryParams: {} });
        if (!this.guidedTour.isStepComplete('familysearch', 'importFamilyTree')) {
          this.guidedTour.startTour([
            {
              ...ImportFamilyTree,
              when: {
                show: () => {
                  this.guidedTour.markStepComplete('familysearch', 'importFamilyTree');
                }
              }
            }
          ]);
        }
      } catch (err) {
        if (err instanceof ConnectorResponse) {
          this.message.showError(err.getMessage(), true);
        }
      }
      this.waiting = false;
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

  private isFacebook(): boolean {
    return this.connector.type === 'type.connector.facebook';
  }

  private isFamilySearch(): boolean {
    return this.connector.type === 'type.connector.familysearch';
  }
}
