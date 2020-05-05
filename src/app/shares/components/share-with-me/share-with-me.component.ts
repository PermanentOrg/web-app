import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { find, filter } from 'lodash';
import { TweenLite, ScrollToPlugin } from 'gsap/all';
import { DataService } from '@shared/services/data/data.service';

import { ConnectorOverviewVO, FolderVO, RecordVO, ArchiveVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { ShareComponent } from '@shares/components/share/share.component';
import { DOCUMENT } from '@angular/common';
import { slideUpAnimation } from '@shared/animations';

@Component({
  selector: 'pr-share-with-me',
  templateUrl: './share-with-me.component.html',
  styleUrls: ['./share-with-me.component.scss'],
  animations: [ slideUpAnimation ]
})
export class ShareWithMeComponent implements OnInit, OnDestroy {
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
    const shares = this.route.snapshot.data.shares as ArchiveVO[] || [];
    const currentArchiveId = this.accountService.getArchive().archiveId;
    this.sharedWithMe = filter(shares, s => s.archiveId !== currentArchiveId);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
