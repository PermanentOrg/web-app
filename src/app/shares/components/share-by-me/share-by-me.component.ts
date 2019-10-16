import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { remove, find } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';

import { FolderVO, RecordVO, ArchiveVO } from '@root/app/models';
import { MessageService } from '@shared/services/message/message.service';

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

    const queryParams = this.route.snapshot.queryParams;

    if (queryParams) {
      if (queryParams.shareArchiveNbr && queryParams.requestToken) {
        console.log(this.sharedByMe, queryParams);
        const targetShare: any = find(this.sharedByMe, { archiveNbr: queryParams.shareArchiveNbr });

        if (!targetShare) {
          this.message.showError('Shared item not found.');
        } else {
          const targetRequest: any = find(targetShare.ShareVOs, { requestToken: queryParams.requestToken }) as any;
          console.log(targetShare, targetShare.ShareVOs);
          if (!targetRequest) {
            this.message.showError('Share request not found.');
          } else if (targetRequest.status.includes('ok')) {
            this.message.showMessage(`Share request for ${targetRequest.ArchiveVO.fullName} already approved.`);
          } else {
            console.log('got it!', targetRequest);
          }
        }
      }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
