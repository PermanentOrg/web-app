import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { find } from 'lodash';
import { DataService } from '@shared/services/data/data.service';

import { ConnectorOverviewVO, FolderVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';

@Component({
  selector: 'pr-shares',
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.scss']
})
export class SharesComponent implements OnInit, OnDestroy {
  sharesFolder: FolderVO;
  connectors: ConnectorOverviewVO[];

  constructor(private route: ActivatedRoute, private dataService: DataService, private accountService: AccountService) {
    const sharesFolder = find(this.accountService.getRootFolder().ChildItemVOs, {type: 'type.folder.root.share'}) as FolderVO;
    sharesFolder.pathAsText = ['Shares'];
    this.sharesFolder = sharesFolder;
    this.dataService.setCurrentFolder(this.sharesFolder);

    const shares = this.route.snapshot.data.shares;
    console.log(shares);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
