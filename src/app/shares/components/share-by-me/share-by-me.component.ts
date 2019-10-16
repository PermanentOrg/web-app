import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  @ViewChildren(FileListItemComponent) listItemsQuery: QueryList<FileListItemComponent>;

  constructor(
    private route: ActivatedRoute,
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

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const queryParams = this.route.snapshot.queryParams;

    if (queryParams) {
      if (queryParams.shareArchiveNbr && queryParams.requestToken) {
        const targetShare = find(this.listItemsQuery.toArray(), (share: FileListItemComponent) => {
          return share.item.archiveNbr === queryParams.shareArchiveNbr;
        }) as FileListItemComponent;

        if (!targetShare) {
          this.message.showError('Shared item not found.');
        } else {
          console.log('got it', targetShare);
          // https://local.permanent.org:4200/m/shares/byme?shareArchiveNbr=064q-00ix&requestToken=85c7622c5b8d635fc517dc055cac08e54e05d014aa186f331e74cfb0f4119419
          // open dialog for share
          targetShare.onActionClick('share', new Deferred());


        }
      }
    }
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
