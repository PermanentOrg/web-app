import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

import { ConnectorOverviewVO, FolderVO } from '@root/app/models';

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

  constructor(private router: Router, private prConstants: PrConstantsService) { }

  ngOnInit() {

    const type = this.connector.type.split('.').pop();
    this.folder = _.find(this.appsFolder.ChildItemVOs, {special: `${type}.root.folder`}) as FolderVO;
    if (this.folder) {
      this.hasFiles = this.folder.ChildItemVOs && this.folder.ChildItemVOs.length;
    }
    this.connectorName = this.prConstants.translate(this.connector.type);
    this.connected = this.connector.status === 'status.connector.connected';
  }

  goToFolder() {
    this.router.navigate(['/apps', this.folder.archiveNbr, this.folder.folder_linkId]);
  }

}
