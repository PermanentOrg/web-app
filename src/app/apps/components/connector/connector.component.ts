import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { ConnectorOverviewVO, FolderVO } from '@root/app/models';

@Component({
  selector: 'pr-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss']
})
export class ConnectorComponent implements OnInit {
  @Input() connector: ConnectorOverviewVO;
  @Input() appsFolder: FolderVO;

  public folder: FolderVO;
  public hasFiles: boolean;

  constructor(private router: Router) { }

  ngOnInit() {
    const type = this.connector.type.split('.').pop();
    this.folder = _.find(this.appsFolder.ChildItemVOs, {special: `${type}.root.folder`}) as FolderVO;
    this.hasFiles = this.folder.ChildItemVOs && this.folder.ChildItemVOs.length;
  }

  goToFolder() {
    this.router.navigate(['/apps', this.folder.archiveNbr, this.folder.folder_linkId]);
  }

}
