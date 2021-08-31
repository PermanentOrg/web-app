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
  ViewChild,
  NgZone,
  Renderer2
} from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UP_ARROW, DOWN_ARROW, CONTROL, META, SHIFT } from '@angular/cdk/keycodes';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { throttle, debounce, find, size } from 'lodash';
import { gsap } from 'gsap';

import { FileListItemComponent, FileListItemVisibleEvent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { DataService, SelectClickEvent, SelectedItemsSet, SelectKeyEvent } from '@shared/services/data/data.service';
import { FolderVO } from '@models/folder-vo';
import { RecordVO, ItemVO } from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { HasSubscriptions, unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { slideUpAnimation, ngIfScaleAnimationDynamic } from '@shared/animations';
import { DragService } from '@shared/services/drag/drag.service';
import { DeviceService } from '@shared/services/device/device.service';
import debug from 'debug';
import { CdkPortal } from '@angular/cdk/portal';
import { Dialog } from '@root/app/dialog/dialog.module';
import { AccountService } from '@shared/services/account/account.service';
import { routeHasDialog } from '@shared/utilities/router';
import { RouteHistoryService } from 'ngx-route-history';

export interface ItemClickEvent {
  event?: MouseEvent;
  item: RecordVO | FolderVO;
}

export interface FileListItemParent {
  onItemClick(itemClick: ItemClickEvent);
}
const VISIBLE_DEBOUNCE = 250;

const DRAG_SCROLL_THRESHOLD = 100; // px from top or bottom
const DRAG_SCROLL_STEP = 20;
@Component({
  selector: 'pr-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
  animations: [ slideUpAnimation, ngIfScaleAnimationDynamic ]
})
export class FileListComponent implements OnInit, AfterViewInit, OnDestroy, HasSubscriptions, FileListItemParent {
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

  private visibleItemsHandlerDebounced: Function;
  private mouseMoveHandlerThrottled: Function;

  private reinit = false;
  private inFileView = false;
  private inDialog = false;

  @ViewChild('scroll') private scrollElement: ElementRef;
  visibleItems: Set<FileListItemComponent> = new Set();

  @ViewChild(CdkPortal) portal: CdkPortal;

  private isDraggingInProgress = false;
  isDraggingFile = false;

  isMultiSelectEnabled = false;
  isMultiSelectEnabledSubscription: Subscription;

  isSorting = false;

  selectedItems: SelectedItemsSet = new Set();

  subscriptions: Subscription[] = [];

  private debug = debug('component:fileList');
  private unlistenMouseMove: Function;

  constructor(
    private account: AccountService,
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private elementRef: ElementRef,
    private dialog: Dialog,
    private folderViewService: FolderViewService,
    private routeHistory: RouteHistoryService,
    private location: Location,
    @Inject(DOCUMENT) private document: any,
    @Optional() private drag: DragService,
    private renderer: Renderer2,
    public device: DeviceService,
    private ngZone: NgZone
  ) {
    this.currentFolder = this.route.snapshot.data.currentFolder;
    // this.noFileListPadding = this.route.snapshot.data.noFileListPadding;
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

    this.visibleItemsHandlerDebounced = debounce(() => this.loadVisibleItems(), VISIBLE_DEBOUNCE);

    this.registerArchiveChangeHandlers();
    this.registerRouterEventHandlers();
    this.registerDataServiceHandlers();
    this.registerDragServiceHandlers();
  }

  registerArchiveChangeHandlers() {
    // register for archive change events to reload the root section
    this.subscriptions.push(
      this.account.archiveChange.subscribe(async archive => {
        // may be in a subfolder we don't have access to, reload just the 'root'
        const url = this.router.url;
        const urlParts = url.split('/').slice(0, 3);
        const currentRoot = urlParts.join('/');
        if (currentRoot !== url) {
          this.router.navigateByUrl(currentRoot);
        } else {
          const timestamp = Date.now();
          const queryParams: any = {};
          queryParams[timestamp] = '';
          this.router.navigate(['.'], {queryParams, preserveQueryParams: false, relativeTo: this.route});
        }
      })
    );
  }

  registerRouterEventHandlers() {
    // register for navigation events to reinit page on folder changes
    this.subscriptions.push(this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd ))
      .subscribe((event: NavigationEnd) => {
        if (event.url.includes('record')) {
          this.inFileView = true;
        }

        if (routeHasDialog(event)) {
          this.inDialog = true;
        }

        if (this.reinit && !this.inFileView && !this.inDialog) {
          this.refreshView();
        }

        if (!event.url.includes('record') && this.inFileView) {
          this.inFileView = false;
        }

        if (!routeHasDialog(event) && this.inDialog) {
          this.inDialog = false;
        }
      }));
  }

  registerDataServiceHandlers() {
    // register for folder update events
    this.subscriptions.push(this.dataService.folderUpdate.subscribe((folder: FolderVO) => {
      setTimeout(() => {
        this.loadVisibleItems();
      }, 500);
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

  registerMouseMoveHandler() {
    if (!this.unlistenMouseMove) {
      this.ngZone.runOutsideAngular(() => {
        this.unlistenMouseMove = this.renderer.listen(
          this.scrollElement.nativeElement,
          'mousemove',
          (event) => this.onViewportMouseMove(event)
        );
      });
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

    this.visibleItems.clear();
    this.reinit = true;
  }

  ngAfterViewInit() {
    if (this.listItemsQuery) {
      this.listItems = this.listItemsQuery.toArray();
    }

    this.registerMouseMoveHandler();

    this.loadVisibleItems(true);

    if (this.showSidebar) {
      this.getScrollElement().scrollTo(0, 0);
    } else {
      // (this.scrollElement.nativeElement as HTMLElement).scrollIntoView(true);
    }

    const queryParams = this.route.snapshot.queryParamMap;
    if (queryParams.has('showItem')) {
      const folder_linkId = Number(queryParams.get('showItem'));
      this.location.replaceState(this.router.url.split('?')[0]);
      const item = find(this.currentFolder.ChildItemVOs, { folder_linkId });
      this.scrollToItem(item);
      if (!this.device.isMobileWidth()) {
        setTimeout(() => {
          this.dataService.onSelectEvent({
            type: 'click',
            item
          });
        });
      }
    }
  }

  ngOnDestroy() {
    this.dataService.setCurrentFolder();
    unsubscribeAll(this.subscriptions);
    if (this.unlistenMouseMove) {
      this.unlistenMouseMove();
    }
  }

  setFolderView(folderView: FolderView) {
    this.folderView = folderView;
    this.inGridView = folderView === FolderView.Grid;
  }

  getScrollElement(): HTMLElement {
    return ((this.device.isMobileWidth() || !this.showSidebar)
    ? this.document.documentElement : this.scrollElement.nativeElement) as HTMLElement;
  }

  onViewportMouseMove(event: MouseEvent) {
    if (this.isDraggingInProgress && this.mouseMoveHandlerThrottled) {
      this.mouseMoveHandlerThrottled(event);
    }
  }

  scrollToItem(item: ItemVO) {
    this.debug('scroll to item %o', item);
    const folder_linkId = item.folder_linkId;
    const listItem = find(this.listItemsQuery.toArray(), x => x.item.folder_linkId === folder_linkId);
    if (listItem) {
      const itemElem = listItem.element.nativeElement as HTMLElement;
      itemElem.scrollIntoView();
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

  async loadVisibleItems(animate ?: boolean) {
    this.debug('loadVisibleItems %d items', this.visibleItems.size);
    if (!this.visibleItems.size) {
      return;
    }

    const visibleListItems = Array.from(this.visibleItems);
    this.visibleItems.clear();
    if (animate) {
      const targetElems = visibleListItems.map(c => c.element.nativeElement);
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

    const itemsToFetch = visibleListItems.map(c => c.item);

    if (itemsToFetch.length) {
      await this.dataService.fetchLeanItems(itemsToFetch);
    }
  }

  onItemVisible(event: FileListItemVisibleEvent) {
    if (event.visible) {
      this.visibleItems.add(event.component);
      this.visibleItemsHandlerDebounced();
    } else {
      this.visibleItems.delete(event.component);
    }
  }

}
