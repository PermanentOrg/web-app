import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { remove, find } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';

import { FolderVO, RecordVO, ArchiveVO } from '@root/app/models';
import { MessageService } from '@shared/services/message/message.service';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { Deferred } from '@root/vendor/deferred';

@Component({
  selector: 'pr-share-by-me',
  templateUrl: './share-by-me.component.html',
  styleUrls: ['./share-by-me.component.scss']
})
export class ShareByMeComponent implements OnInit, OnDestroy {
  sharesFolder: FolderVO;
  sharedByMe: Array<FolderVO | RecordVO>;
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
    this.sharesFolder = new FolderVO({
      displayName: 'Shared By Me',
      pathAsText: ['Shared By Me'],
      type: 'type.folder.root.share'
    });
    this.dataService.setCurrentFolder(this.sharesFolder);

    const shares = this.route.snapshot.data.shares as ArchiveVO[];
    const currentArchive = remove(shares, {archiveId: this.accountService.getArchive().archiveId}).pop() as ArchiveVO;

    this.sharedByMe = currentArchive ? currentArchive.ItemVOs : [];

    // check shared with me for item to redirect if needed
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams) {
      if (queryParams.shareArchiveNbr) {
        for (const shareArchive of shares) {
          const targetShare = find(shareArchive.ItemVOs, { archiveNbr: queryParams.shareArchiveNbr });
          if (targetShare) {
            this.router.navigate(['shares', 'withme'], { queryParamsHandling: 'preserve' });
            this.shareItemFound = true;
          }
        }
      }
    }

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const queryParams = this.route.snapshot.queryParams;

    if (queryParams) {
      if (queryParams.shareArchiveNbr) {
        const targetShare = find(this.listItemsQuery.toArray(), (share: FileListItemComponent) => {
          return share.item.archiveNbr === queryParams.shareArchiveNbr;
        }) as FileListItemComponent;

        if (!targetShare && !this.shareItemFound) {
          this.message.showError('Shared item not found.');
        } else if (targetShare) {
          targetShare.onActionClick('share', new Deferred());
        }
      }
    }
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
