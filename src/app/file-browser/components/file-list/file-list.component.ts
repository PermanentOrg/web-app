import {
  Component,
  Inject,
  OnInit,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
  HostListener,
  OnDestroy
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { throttle, debounce } from 'lodash';
import { TweenMax } from 'gsap';

import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@models/folder-vo';
import { RecordVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';

const NAV_HEIGHT = 84;
const ITEM_HEIGHT = 51;
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

  private scrollHandlerDebounced: Function;
  private scrollHandlerThrottled: Function;

  private itemsFetchedCount: number;
  private routeListener: Subscription;
  private reinit = false;
  private inFileView = false;

  private lastScrollTop: number;
  private currentScrollTop: number;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    @Inject(DOCUMENT) private document: any
  ) {
    this.currentFolder = this.route.snapshot.data.currentFolder;

    this.dataService.setCurrentFolder(this.currentFolder);

    // create debounced scroll handler for placeholder loading
    this.scrollHandlerDebounced = debounce(this.calculateListViewport.bind(this), SCROLL_DEBOUNCE);
    this.scrollHandlerThrottled = throttle(this.calculateListViewport.bind(this), SCROLL_THROTTLE);

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

    this.calculateListViewport(true);
    this.document.documentElement.scrollTop = 0;
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
    this.routeListener.unsubscribe();
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

  calculateListViewport(animate ?: boolean) {
    if (this.itemsFetchedCount >= this.currentFolder.ChildItemVOs.length) {
      return;
    }

    const totalHeight = this.document.documentElement.clientHeight || this.document.body.clientHeight;
    const viewportHeight = totalHeight - NAV_HEIGHT;

    const top = this.document.documentElement.scrollTop || this.document.body.scrollTop;
    const offset = Math.floor(top / ITEM_HEIGHT);
    const count = Math.ceil(viewportHeight / ITEM_HEIGHT) + 4;

    if (animate) {
      const targetElems = this.listItems.slice(0, count).map((item) => item.element.nativeElement);
      TweenMax.staggerFrom(
        targetElems,
        0.25,
        {
          opacity: 0,
          ease: 'Power4.easeOut'
        },
        0.015
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
