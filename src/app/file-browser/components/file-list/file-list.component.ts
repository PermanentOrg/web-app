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
  Input,
  Optional,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UP_ARROW, DOWN_ARROW, CONTROL, META, SHIFT } from '@angular/cdk/keycodes';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { throttle, debounce, find } from 'lodash';
import { gsap } from 'gsap';

import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { DataService, SelectClickEvent, SelectedItemsMap, SelectKeyEvent } from '@shared/services/data/data.service';
import { FolderVO } from '@models/folder-vo';
import { RecordVO, ItemVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { ScrollService } from '@shared/services/scroll/scroll.service';
import { slideUpAnimation, fadeAnimation } from '@shared/animations';
import { DragService } from '@shared/services/drag/drag.service';
import { DeviceService } from '@shared/services/device/device.service';
import { MainComponent } from '@core/components/main/main.component';

export interface ItemClickEvent {
  event?: MouseEvent;
  item: RecordVO | FolderVO;
}

const NAV_HEIGHT = 84;
const ITEM_HEIGHT_LIST_VIEW = 51;

const ITEM_MAX_WIDTH_GRID_VIEW = 200;

const SCROLL_DEBOUNCE = 150;
const SCROLL_THROTTLE = 500;
const SCROLL_TIMING = 16;
const SCROLL_VELOCITY_THRESHOLD = 4;

const DRAG_SCROLL_THRESHOLD = 100; // px from top or bottom
const DRAG_SCROLL_STEP = 20;
@Component({
  selector: 'pr-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
  animations: [ slideUpAnimation, fadeAnimation ]
})
export class FileListComponent implements OnInit, AfterViewInit, OnDestroy, HasSubscriptions {
  @ViewChildren(FileListItemComponent) listItemsQuery: QueryList<FileListItemComponent>;

  currentFolder: FolderVO;
  listItems: FileListItemComponent[] = [];

  folderView = FolderView.List;
  @HostBinding('class.grid-view') inGridView = false;
  @HostBinding('class.no-padding') noFileListPadding = false;
  @HostBinding('class.show-sidebar') showSidebar = false;
  @HostBinding('class.file-list-centered') fileListCentered = false;
  showFolderDescription = false;
  isRootFolder = false;

  @Input() allowNavigation = true;

  private scrollHandlerDebounced: Function;
  private scrollHandlerThrottled: Function;
  private mouseMoveHandlerThrottled: Function;

  private itemsFetchedCount: number;
  private routeListener: Subscription;
  private reinit = false;
  private inFileView = false;

  private lastScrollTop = 0;
  private lastItemOffset: number;
  private currentScrollTop = 0;
  @ViewChild('scroll') private scrollElement: ElementRef;

  private isDraggingInProgress = false;
  isDraggingFile = false;

  isMultiSelectEnabled = false;
  isMultiSelectEnabledSubscription: Subscription;

  isSorting = false;


  selectedItems: SelectedItemsMap = new Map();

  subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private elementRef: ElementRef,
    private folderViewService: FolderViewService,
    @Inject(DOCUMENT) private document: any,
    @Optional() private drag: DragService,
    public device: DeviceService
  ) {
    this.currentFolder = this.route.snapshot.data.currentFolder;
    this.noFileListPadding = this.route.snapshot.data.noFileListPadding;
    this.fileListCentered = this.route.snapshot.data.fileListCentered;
    this.showSidebar = this.route.snapshot.data.showSidebar;

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

    this.registerRouterEventHandlers();
    this.registerDataServiceHandlers();
    this.registerDataServiceHandlers();
  }

  registerRouterEventHandlers() {
    // register for navigation events to reinit page on folder changes
    this.subscriptions.push(this.router.events
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
      }));
  }

  registerDataServiceHandlers() {
    // register for folder update events
    this.subscriptions.push(this.dataService.folderUpdate.subscribe((folder: FolderVO) => {
      setTimeout(() => {
        this.loadVisibleItems();
      });
    }));

    // register for multi select events
    this.subscriptions.push(this.dataService.multiSelectChange.subscribe(enabled => {
      this.isMultiSelectEnabled = enabled;
    }));

    // register for select events
    this.subscriptions.push(this.dataService.selectedItems$().subscribe(selectedItems => {
      this.selectedItems = selectedItems;
    }));

    // register for 'show item' events
    this.subscriptions.push(
      this.dataService.itemToShow$().subscribe(item => {
        setTimeout(() => {
          this.scrollToItem(item);
        });
      }
    ));
  }

  registerDragServiceHandlers() {
    // register for drag events to scroll if needed
    if (this.drag) {
      this.subscriptions.push(
        this.drag.events().subscribe(dragEvent => {
            switch (dragEvent.type) {
              case 'start':
              case 'end':
                this.isDraggingInProgress = dragEvent.type === 'start';
                break;
            }
        })
      );

      this.mouseMoveHandlerThrottled = throttle((event: MouseEvent) => {
        this.checkDragScrolling(event);
      }, 64);
    }
  }

  refreshView() {
    this.ngOnInit();
    setTimeout(() => {
      this.ngAfterViewInit();
    }, 1);
  }

  ngOnInit() {
    this.currentFolder = this.route.snapshot.data.currentFolder;
    this.showSidebar = this.route.snapshot.data.showSidebar;
    this.dataService.setCurrentFolder(this.currentFolder);
    this.isRootFolder = this.currentFolder.type.includes('root');
    this.showFolderDescription = this.route.snapshot.data.showFolderDescription;

    this.itemsFetchedCount = 0;
    this.reinit = true;
  }

  ngAfterViewInit() {
    if (this.listItemsQuery) {
      this.listItems = this.listItemsQuery.toArray();
    }

    this.loadVisibleItems(true);
    this.getScrollElement().scrollTo(0, 0);
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
    unsubscribeAll(this.subscriptions);
  }

  setFolderView(folderView: FolderView) {
    this.folderView = folderView;
    this.inGridView = folderView === FolderView.Grid;
    setTimeout(() => {
      // scroll to show items after change
      const scrollTarget: FileListItemComponent = this.listItems[this.lastItemOffset];
      (scrollTarget.element.nativeElement as HTMLElement).scrollIntoView({behavior: 'smooth'});
      this.scrollHandlerThrottled();
    });
  }

  getScrollElement(): HTMLElement {
    return ((this.device.isMobileWidth() || !this.showSidebar)
    ? this.document.documentElement : this.scrollElement.nativeElement) as HTMLElement;
  }

  @HostListener('window:scroll', ['$event'])
  onViewportScroll(event: Event) {
    this.lastScrollTop = this.currentScrollTop;
    if (event) {
      const target = event.currentTarget;
      this.currentScrollTop = target === window ? this.document.documentElement.scrollTop : (target as HTMLElement).scrollTop;
    }

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

  onViewportMouseMove(event: MouseEvent) {
    if (this.isDraggingInProgress && this.mouseMoveHandlerThrottled) {
      this.mouseMoveHandlerThrottled(event);
    }
  }

  scrollToItem(item: ItemVO) {
    const folder_linkId = item.folder_linkId;
    const listItem = find(this.listItemsQuery.toArray(), x => x.item.folder_linkId === folder_linkId);
    if (listItem) {
      const itemElem = listItem.element.nativeElement as HTMLElement;
      itemElem.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }

  checkDragScrolling(event: MouseEvent) {
    const scrollElem = (this.scrollElement.nativeElement) as HTMLElement;
    const bounds = scrollElem.getBoundingClientRect();
    const top = bounds.top;
    const bottom = top + bounds.height;
    const currentScrollTop = scrollElem.scrollTop;
    const currentScrollHeight = scrollElem.scrollHeight;
    const maxScrollTop = currentScrollHeight - bounds.height;

    if (top < event.clientY && event.clientY < (top + DRAG_SCROLL_THRESHOLD)) {
      if (currentScrollTop > 0) {
        let step = DRAG_SCROLL_STEP;
        if (event.clientY < (top + (DRAG_SCROLL_THRESHOLD / 2 ))) {
          step = step * 3;
        }
        scrollElem.scrollBy({left: 0, top: -step, behavior: 'smooth'});
        if (scrollElem.scrollTop > 0) {
          this.mouseMoveHandlerThrottled(event);
        }
      }
    } else if (bottom > event.clientY && event.clientY > (bottom - DRAG_SCROLL_THRESHOLD)) {
      if (currentScrollTop < maxScrollTop) {
        let step = DRAG_SCROLL_STEP;
        if (event.clientY > (maxScrollTop - (DRAG_SCROLL_THRESHOLD / 2 ))) {
          step = step * 3;
        }
        scrollElem.scrollBy({left: 0, top: step, behavior: 'smooth'});
        if (scrollElem.scrollTop < maxScrollTop) {
          this.mouseMoveHandlerThrottled(event);
        }
      }
    }
  }

  onItemClick(itemClick: ItemClickEvent) {
    if (!this.showSidebar) {
      return;
    }

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

  onSort(isSorting: boolean) {
    this.isSorting = isSorting;
  }

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent) {
    if (this.checkKeyEvent(event)) {
      if (event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW) {
        event.preventDefault();
        const selectEvent: SelectKeyEvent = {
          type: 'key',
          key: event.keyCode === UP_ARROW ? 'up' : 'down'
        };

        if (event.shiftKey) {
          selectEvent.modifierKey = 'shift';
        }

        this.dataService.onSelectEvent(selectEvent);
      }

    }
  }

  @HostListener('window:keydown.control.a', ['$event'])
  @HostListener('window:keydown.meta.a', ['$event'])
  onSelectAllKeypress(event: KeyboardEvent) {
    if (this.checkKeyEvent(event)) {
      event.preventDefault();
      const selectEvent: SelectKeyEvent = {
        type: 'key',
        key: 'a',
        modifierKey: 'ctrl'
      };

      this.dataService.onSelectEvent(selectEvent);
    }
  }

  checkKeyEvent(event: KeyboardEvent) {
    return event.target === this.document.body && !this.router.url.includes('record');
  }

  loadVisibleItems(animate ?: boolean) {
    if (this.itemsFetchedCount >= this.currentFolder.ChildItemVOs.length) {
      return;
    }

    const totalHeight = this.document.documentElement.clientHeight || this.document.body.clientHeight;
    const viewportHeight = totalHeight - NAV_HEIGHT;
    const listWidth = (this.elementRef.nativeElement as HTMLElement).clientWidth;

    const top = this.currentScrollTop || 0;

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
      .filter((item: ItemVO) => {
        return !item.isFetching && item.dataStatus < DataStatus.Lean;
      });

    if (itemsToFetch.length) {
      this.dataService.fetchLeanItems(itemsToFetch)
      .then((fetchedCount: number) => {
        this.itemsFetchedCount += fetchedCount;
      })
      .catch((response) => {
        console.error(response);
      });
    }
  }

}
