import { Component, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '@shared/services/data/data.service';

import { ConnectorOverviewVO, FolderVO } from '@root/app/models';
import { ConnectorComponent } from '../connector/connector.component';
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

  constructor(private route: ActivatedRoute, private dataService: DataService) {
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
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
