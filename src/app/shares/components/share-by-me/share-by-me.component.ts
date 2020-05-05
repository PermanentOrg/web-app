import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { find } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';

import { FolderVO, RecordVO, ArchiveVO, ItemVO } from '@root/app/models';
import { MessageService } from '@shared/services/message/message.service';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { Deferred } from '@root/vendor/deferred';
import { slideUpAnimation } from '@shared/animations';

@Component({
  selector: 'pr-share-by-me',
  templateUrl: './share-by-me.component.html',
  styleUrls: ['./share-by-me.component.scss'],
  animations: [ slideUpAnimation ]
})
export class ShareByMeComponent implements OnInit, OnDestroy {
  sharesFolder: FolderVO;
  sharedByMe: Array<ItemVO>;
  sharedWithMe: ArchiveVO[];

  shareItemFound = false;

  @ViewChildren(FileListItemComponent) listItemsQuery: QueryList<FileListItemComponent>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private accountService: AccountService,
    private message: MessageService
  ) {
    const shares = this.route.snapshot.data.shares as ArchiveVO[];
    const currentArchiveId = this.accountService.getArchive().archiveId;
    const currentShareArchive = find(shares, { archiveId: currentArchiveId });
    console.log(shares, currentArchiveId, currentShareArchive);
    this.sharedByMe = currentShareArchive ? currentShareArchive.ItemVOs : [];
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
