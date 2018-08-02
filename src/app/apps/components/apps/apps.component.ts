import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '@shared/services/data/data.service';

import { ConnectorOverviewVO, FolderVO } from '@root/app/models';

@Component({
  selector: 'pr-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent implements OnInit, OnDestroy {
  appsFolder: FolderVO;
  connectors: ConnectorOverviewVO[];

  constructor(private route: ActivatedRoute, private dataService: DataService) {
    this.appsFolder = this.route.snapshot.data.appsFolder;
    this.connectors = this.route.snapshot.data.connectors;

    this.dataService.setCurrentFolder(this.appsFolder);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
