import { Component, OnInit, Input, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ArchiveVO, FolderVO, RecordVO } from '@root/app/models/index';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { ActivatedRoute } from '@angular/router';
import { find, remove } from 'lodash';
import { Deferred } from '@root/vendor/deferred';

@Component({
  selector: 'pr-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit, AfterViewInit {
  @Input() archive: ArchiveVO;

  @ViewChildren(FileListItemComponent) listItemsQuery: QueryList<FileListItemComponent>;

  constructor(
    public element: ElementRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    const queryParams = this.route.snapshot.queryParams;

    if (queryParams) {
      if (queryParams.shareArchiveNbr) {
        const targetShare = find(this.listItemsQuery.toArray(), (share: FileListItemComponent) => {
          return share.item.archiveNbr === queryParams.shareArchiveNbr;
        }) as FileListItemComponent;

        if (targetShare) {
          targetShare.onActionClick('share', new Deferred());
        }
      }
    }
  }

  onShareDeleted(item: FolderVO | RecordVO) {
    if (this.archive && this.archive.ItemVOs) {
      remove(this.archive.ItemVOs, item);
    }
  }

}
