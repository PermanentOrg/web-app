import { Component, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '@shared/services/data/data.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { ConnectorOverviewVO, FolderVO } from '@root/app/models';
import { ConnectorComponent, FAMILYSEARCH_CONNECT_KEY } from '../connector/connector.component';
import { find } from 'lodash';

@Component({
  selector: 'pr-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent implements OnInit, AfterViewInit, OnDestroy {
  appsFolder: FolderVO;
  connectors: ConnectorOverviewVO[];

  @ViewChildren(ConnectorComponent) connectorComponents: QueryList<ConnectorComponent>;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private storage: StorageService
  ) {
    this.appsFolder = this.route.snapshot.data.appsFolder;
    this.connectors = this.route.snapshot.data.connectors;

    this.dataService.setCurrentFolder(this.appsFolder);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const queryParams = this.route.snapshot.queryParams;

    if (queryParams.facebook !== undefined) {
      const connectorComponents = this.connectorComponents.toArray();
      const fbConnectorComponent = find(connectorComponents, (comp: ConnectorComponent) => {
        return comp.connector.type === 'type.connector.facebook';
      });
      fbConnectorComponent.connect();
    }

    if (queryParams.code && this.storage.local.get(FAMILYSEARCH_CONNECT_KEY)) {
      const connectorComponents = this.connectorComponents.toArray();
      const fsConnectorComponent = find(connectorComponents, (comp: ConnectorComponent) => {
        return comp.connector.type === 'type.connector.familysearch';
      });
      fsConnectorComponent.authorize(queryParams.code);
    }
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
