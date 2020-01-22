import {
  Component,
  Inject,
  OnInit,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
  HostListener,
  OnDestroy,
  HostBinding,
  Input
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { throttle, debounce } from 'lodash';
import { gsap } from 'gsap';

import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@models/folder-vo';
import { RecordVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';

const NAV_HEIGHT = 84;
const ITEM_HEIGHT_LIST_VIEW = 51;

const ITEM_MAX_WIDTH_GRID_VIEW = 200;

const SCROLL_DEBOUNCE = 150;
const SCROLL_THROTTLE = 500;
const SCROLL_TIMING = 16;
const SCROLL_VELOCITY_THRESHOLD = 4;

@Component({
  selector: 'pr-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(FileListItemComponent) listItemsQuery: QueryList<FileListItemComponent>;

  currentFolder: FolderVO;
  listItems: FileListItemComponent[] = [];

  folderView = FolderView.List;
  @HostBinding('class.grid-view') inGridView = false;
  @HostBinding('class.no-padding') noFileListPadding = false;

  @Input() allowNavigation = true;

  private scrollHandlerDebounced: Function;
  private scrollHandlerThrottled: Function;

  private itemsFetchedCount: number;
  private routeListener: Subscription;
  private reinit = false;
  private inFileView = false;

  private lastScrollTop: number;
  private lastItemOffset: number;
  private currentScrollTop: number;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private elementRef: ElementRef,
    private folderViewService: FolderViewService,
    @Inject(DOCUMENT) private document: any
  ) {
    this.currentFolder = this.route.snapshot.data.currentFolder;
    this.noFileListPadding = this.route.snapshot.data.noFileListPadding;

    if (this.route.snapshot.data.noFileListNavigation) {
      this.allowNavigation = false;
    }

    this.dataService.setCurrentFolder(this.currentFolder);

    // get current app-wide folder view and register for updates
    this.folderView = this.folderViewService.folderView;
    this.inGridView = this.folderView === FolderView.Grid;
    this.folderViewService.viewChange.subscribe((folderView: FolderView) => {
      this.setFolderView(folderView);
    });

    // create debounced scroll handler for placeholder loading
    this.scrollHandlerDebounced = debounce(this.loadVisibleItems.bind(this), SCROLL_DEBOUNCE);
    this.scrollHandlerThrottled = throttle(this.loadVisibleItems.bind(this), SCROLL_THROTTLE);

    // register for navigation events to reinit page on folder changes
    if (!this.routeListener) {
      this.routeListener = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd ))
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('record')) {
          this.inFileView = true;
        }

        if (this.reinit && !this.inFileView) {
          this.refreshView();
        }

        if (!event.url.includes('record') && this.inFileView) {
          this.inFileView = false;
        }
      });
    }

    // register for folder update events
    this.dataService.folderUpdate.subscribe((folder: FolderVO) => {
      if (folder.folderId === this.currentFolder.folderId) {
        setTimeout(() => {
          this.refreshView();
        }, 100);
      }
    });
  }

  refreshView() {
    this.ngOnInit();
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 1);
  }

  ngOnInit() {
    this.currentFolder = this.route.snapshot.data.currentFolder;
    this.dataService.setCurrentFolder(this.currentFolder);

    this.itemsFetchedCount = 0;
    this.reinit = true;
  }

  ngAfterViewInit() {
    if (this.listItemsQuery) {
      this.listItems = this.listItemsQuery.toArray();
    }

    this.loadVisibleItems(true);
    this.document.documentElement.scrollTop = 0;
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
    this.routeListener.unsubscribe();
  }

  setFolderView(folderView: FolderView) {
    this.folderView = folderView;
    this.inGridView = folderView === FolderView.Grid;
    setTimeout(() => {
      // scroll to show items after change
      const scrollTarget: FileListItemComponent = this.listItems[this.lastItemOffset];
      this.document.documentElement.scrollTop = (scrollTarget.element.nativeElement as HTMLElement).offsetTop - NAV_HEIGHT;
      this.scrollHandlerThrottled();
    });
  }

  @HostListener('window:scroll', ['$event'])
  onViewportScroll(event) {
    this.lastScrollTop = this.currentScrollTop;
    this.currentScrollTop = this.document.documentElement.scrollTop || this.document.body.scrollTop;
    const scrollVelocity = (this.lastScrollTop - this.currentScrollTop) / SCROLL_TIMING;
    if (Math.abs(scrollVelocity) < SCROLL_VELOCITY_THRESHOLD) {
      // use throttled handler if scrolling slowly
      this.scrollHandlerThrottled();
    } else {
      // use debounced handler if scrolling quickly
      this.scrollHandlerDebounced();
    }
  }

  @HostListener('window:resize', ['$event'])
  onViewportResize(event) {
    this.scrollHandlerDebounced();
  }

  loadVisibleItems(animate ?: boolean) {
    if (this.itemsFetchedCount >= this.currentFolder.ChildItemVOs.length) {
      return;
    }

    const totalHeight = this.document.documentElement.clientHeight || this.document.body.clientHeight;
    const viewportHeight = totalHeight - NAV_HEIGHT;
    const listWidth = (this.elementRef.nativeElement as HTMLElement).clientWidth;

    const top = this.document.documentElement.scrollTop || this.document.body.scrollTop;

    let offset, count, itemHeight;
    let itemsPerRow = 1;

    if (this.folderView === FolderView.List) {
      itemHeight = ITEM_HEIGHT_LIST_VIEW;
    } else {
      itemsPerRow = Math.max(Math.floor(listWidth / ITEM_MAX_WIDTH_GRID_VIEW), 2);
      itemHeight = this.listItems[0] ? this.listItems[0].element.nativeElement.clientHeight : ITEM_HEIGHT_LIST_VIEW;
    }

    offset = Math.floor(top / itemHeight) * itemsPerRow;
    this.lastItemOffset = offset;

    count = (Math.ceil(viewportHeight / itemHeight) + 4) * itemsPerRow;

    if (animate) {
      const targetElems = this.listItems.slice(0, count).map((item) => item.element.nativeElement);
      gsap.from(
        targetElems,
        0.25,
        {
          duration: 0.25,
          opacity: 0,
          ease: 'Power4.easeOut',
          stagger: {
            amount: 0.015
          }
        },
      );
    }

    const itemsToFetch = this.currentFolder.ChildItemVOs
      .slice(offset, offset + count)
      .filter((item: FolderVO | RecordVO) => {
        return !item.isFetching && item.dataStatus < DataStatus.Lean;
      });

    this.dataService.fetchLeanItems(itemsToFetch)
      .then((fetchedCount: number) => {
        this.itemsFetchedCount += fetchedCount;
      })
      .catch((response) => {
        console.error(response);
      });
  }

}
