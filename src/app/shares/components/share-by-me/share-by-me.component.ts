import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { remove } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';

import { FolderVO, RecordVO, ArchiveVO } from '@root/app/models';

@Component({
  selector: 'pr-share-by-me',
  templateUrl: './share-by-me.component.html',
  styleUrls: ['./share-by-me.component.scss']
})
export class ShareByMeComponent implements OnInit, OnDestroy {
  sharesFolder: FolderVO;
  sharedByMe: Array<FolderVO | RecordVO>;
  sharedWithMe: ArchiveVO[];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private accountService: AccountService
  ) {
    this.sharesFolder = new FolderVO({
      displayName: 'Shared By Me',
      pathAsText: ['Shared By Me'],
      type: 'type.folder.root.share'
    });
    this.dataService.setCurrentFolder(this.sharesFolder);

    const shares = this.route.snapshot.data.shares as ArchiveVO[];
    const currentArchive = remove(shares, {archiveId: this.accountService.getArchive().archiveId}).pop() as ArchiveVO;

    this.sharedByMe = currentArchive ? currentArchive.ItemVOs : [];
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
