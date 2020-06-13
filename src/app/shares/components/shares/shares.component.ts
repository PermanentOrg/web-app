import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, Inject, HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { find, remove } from 'lodash';
import { TweenLite, ScrollToPlugin } from 'gsap/all';
import { DataService, SelectClickEvent, SelectedItemsSet } from '@shared/services/data/data.service';

import { ConnectorOverviewVO, FolderVO, RecordVO, ArchiveVO, ShareVO, ItemVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { ShareComponent } from '@shares/components/share/share.component';
import { DOCUMENT } from '@angular/common';
import { MessageService } from '@shared/services/message/message.service';
import { DeviceService } from '@shared/services/device/device.service';
import { slideUpAnimation, fadeAnimation, ngIfScaleAnimationDynamic } from '@shared/animations';
import { FileListItemParent, ItemClickEvent } from '@fileBrowser/components/file-list/file-list.component';
import { Subscription } from 'rxjs';
import debug from 'debug';
import { unsubscribeAll, HasSubscriptions } from '@shared/utilities/hasSubscriptions';
import { EditService } from '@core/services/edit/edit.service';

@Component({
  selector: 'pr-shares',
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.scss'],
  animations: [ slideUpAnimation, fadeAnimation, ngIfScaleAnimationDynamic ]
})
export class SharesComponent implements OnInit, AfterViewInit, OnDestroy, FileListItemParent, HasSubscriptions {
  @ViewChildren(ShareComponent) shareComponents: QueryList<ShareComponent>;

  @HostBinding('class.show-sidebar') showSidebar = true;
  sharedByMe: ItemVO;
  sharedWithMe: ItemVO[];
  allShareItems: ItemVO[] = [];
  shareItems: ItemVO[] = [];

  selectedItems: SelectedItemsSet = new Set();

  subscriptions: Subscription[] = [];
  private debug = debug('component:fileList');
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private editService: EditService,
    private accountService: AccountService,
    public device: DeviceService,
    @Inject(DOCUMENT) private document: any
  ) {
    const currentArchive = this.accountService.getArchive();
    const shareArchives = this.route.snapshot.data.shares as ArchiveVO[] || [];
    for (const archive of shareArchives) {
      for (const item of archive.ItemVOs) {
        item.ShareArchiveVO = archive;
        if (archive.archiveId !== currentArchive.archiveId) {
          this.shareItems.push(item);
        }

        this.allShareItems.push(item);
      }
    }

    const sharesFolder = new FolderVO({
      displayName: 'Shares',
      pathAsText: ['Shares'],
      type: 'type.folder.root.share',
      ChildItemVOs: this.shareItems
    });

    this.dataService.setCurrentFolder(sharesFolder);

    this.registerDataServiceHandlers();
  }

  registerDataServiceHandlers() {
    this.subscriptions.push(this.dataService.selectedItems$().subscribe(selectedItems => {
      this.selectedItems = selectedItems;
    }));

    this.subscriptions.push(this.dataService.unsharedItem$().subscribe(item => {
      item.isPendingAction = true;
      this.dataService.clearSelectedItems();
      remove(this.shareItems, item);
    }));
  }

  ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;

    if (queryParams.shareArchiveNbr) {
      const targetItem = find(this.allShareItems, { archiveNbr: queryParams.shareArchiveNbr });
      if (targetItem) {
        this.editService.openShareDialog(targetItem);
      }
    }
  }

  ngAfterViewInit() {
    // if (this.route.snapshot.params) {
    //   const archiveNbr = this.route.snapshot.params.shareArchiveNbr;
    //   if (archiveNbr) {
    //     const targetShare = find(this.shareComponents.toArray(), (share: ShareComponent) => {
    //       return share.archive.archiveNbr === archiveNbr;
    //     }) as ShareComponent;

    //     if (targetShare) {
    //       (targetShare.element.nativeElement as HTMLElement).scrollIntoView({behavior: 'smooth', block: 'start' });
    //     }
    //   }
    // }
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
    unsubscribeAll(this.subscriptions);
  }

  onItemClick(itemClick: ItemClickEvent) {
    const selectEvent: SelectClickEvent = {
      type: 'click',
      item: itemClick.item,
    };

    if (itemClick.event?.shiftKey) {
      selectEvent.modifierKey = 'shift';
    } else if (itemClick.event?.metaKey || itemClick.event?.ctrlKey) {
      selectEvent.modifierKey = 'ctrl';
    }

    this.dataService.onSelectEvent(selectEvent);
  }

}
