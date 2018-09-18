import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { find, remove } from 'lodash';
import { TweenLite, ScrollToPlugin } from 'gsap/all';
import { DataService } from '@shared/services/data/data.service';

import { ConnectorOverviewVO, FolderVO, RecordVO, ArchiveVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { ShareComponent } from '@shares/components/share/share.component';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'pr-shares',
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.scss']
})
export class SharesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(ShareComponent) shareComponents: QueryList<ShareComponent>;

  sharesFolder: FolderVO;
  sharedByMe: Array<FolderVO | RecordVO>;
  sharedWithMe: ArchiveVO[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private accountService: AccountService,
    @Inject(DOCUMENT) private document: any
  ) {
    this.sharesFolder = new FolderVO({
      displayName: 'Shares',
      pathAsText: ['Shares'],
      type: 'type.folder.root.share'
    });
    this.dataService.setCurrentFolder(this.sharesFolder);

    const shares = this.route.snapshot.data.shares as ArchiveVO[];
    const currentArchive = remove(shares, {archiveId: this.accountService.getArchive().archiveId}).pop() as ArchiveVO;

    this.sharedByMe = currentArchive ? currentArchive.ItemVOs : [];
    this.sharedWithMe = shares;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.route.snapshot.params) {
      const archiveNbr = this.route.snapshot.params.archiveNbr;
      if (archiveNbr) {
        const targetShare = find(this.shareComponents.toArray(), (share: ShareComponent) => {
          return share.archive.archiveNbr === archiveNbr;
        }) as ShareComponent;

        if (targetShare) {
          window.scrollTo(0, targetShare.element.nativeElement.offsetTop - 100);
        }
      }
    }
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
  }

}
