import {
	Component,
	Inject,
	OnInit,
	AfterViewInit,
	ElementRef,
	EventEmitter,
	QueryList,
	ViewChildren,
	HostListener,
	OnDestroy,
	HostBinding,
	Input,
	Optional,
	Output,
	ViewChild,
	NgZone,
	Renderer2,
	DOCUMENT,
	OnChanges,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UP_ARROW, DOWN_ARROW } from '@angular/cdk/keycodes';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { throttle, debounce, find } from 'lodash';
import { gsap } from 'gsap';

import {
	FileListItemComponent,
	FileListItemVisibleEvent,
} from '@fileBrowser/components/file-list-item/file-list-item.component';
import {
	DataService,
	SelectClickEvent,
	SelectedItemsSet,
	SelectKeyEvent,
} from '@shared/services/data/data.service';
import { FolderVO } from '@models/folder-vo';
import { RecordVO, ItemVO } from '@root/app/models';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import {
	slideUpAnimation,
	ngIfScaleAnimationDynamic,
} from '@shared/animations';
import { DragService } from '@shared/services/drag/drag.service';
import { DeviceService } from '@shared/services/device/device.service';
import debug from 'debug';
import { CdkPortal } from '@angular/cdk/portal';
import { AccountService } from '@shared/services/account/account.service';
import { routeHasDialog } from '@shared/utilities/router';
import { RouteHistoryService } from '@root/app/route-history/route-history.service';
import { EventService } from '@shared/services/event/event.service';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';

export interface ItemClickEvent {
	event?: MouseEvent;
	item: RecordVO | FolderVO;
	selectable?: boolean;
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
	animations: [slideUpAnimation, ngIfScaleAnimationDynamic],
	standalone: false,
})
export class FileListComponent
	implements
		OnChanges,
		OnInit,
		AfterViewInit,
		OnDestroy,
		HasSubscriptions,
		FileListItemParent
{
	@ViewChildren(FileListItemComponent)
	listItemsQuery: QueryList<FileListItemComponent>;

	/**
	 * currentFolder represents the shared folder in case of unlisted shares and
	 * the rendered folder when the component is used in private/public/shared features
	 */
	currentFolder: FolderVO;
	listItems: FileListItemComponent[] = [];

	folderView = FolderView.List;
	@HostBinding('class.grid-view') inGridView = false;
	@HostBinding('class.no-padding') noFileListPadding = false;
	@HostBinding('class.show-sidebar') showSidebar = false;
	@HostBinding('class.file-list-centered') fileListCentered = false;
	showFolderDescription = false;
	isRootFolder = false;

	public showFolderThumbnails = false;

	@Input() allowNavigation = true;

	/**
	 * the ephemeralFolder is useful for using the component as is, without needing to change the route
	 * also this will preserve the currentFolder, where the navigation by click starts from
	 */
	@Input() ephemeralFolder: FolderVO = null;

	@Output() itemClicked = new EventEmitter<ItemClickEvent>();

	private visibleItemsHandlerDebounced: Function;
	private mouseMoveHandlerThrottled: Function;

	private reinit = false;
	private inFileView = false;
	private inDialog = false;
	private isUnlistedShare = false;

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
		private folderViewService: FolderViewService,
		private routeHistory: RouteHistoryService,
		private location: Location,
		@Inject(DOCUMENT) private document: any,
		@Optional() private drag: DragService,
		private renderer: Renderer2,
		public device: DeviceService,
		private ngZone: NgZone,
		private event: EventService,
		private shareLinksService: ShareLinksService,
	) {
		this.currentFolder =
			this.ephemeralFolder || this.route.snapshot.data.currentFolder;
		// this.noFileListPadding = this.route.snapshot.data.noFileListPadding;
		this.fileListCentered = this.route.snapshot.data.fileListCentered;
		this.showSidebar = this.route.snapshot.data.showSidebar;

		if (this.route.snapshot.data.noFileListNavigation) {
			this.allowNavigation = false;
		}

		this.showFolderThumbnails = this.route.snapshot.data?.isPublicArchive;

		this.dataService.setCurrentFolder(this.currentFolder);

		// get current app-wide folder view and register for updates
		this.folderView = this.folderViewService.folderView;
		this.inGridView = this.folderView === FolderView.Grid;
		this.folderViewService.viewChange.subscribe((folderView: FolderView) => {
			this.setFolderView(folderView);
		});

		this.visibleItemsHandlerDebounced = debounce(
			async () => await this.loadVisibleItems(),
			VISIBLE_DEBOUNCE,
		);

		this.registerArchiveChangeHandlers();
		this.registerRouterEventHandlers();
		this.registerDataServiceHandlers();
		this.registerDragServiceHandlers();

		const isPrivateRoot =
			this.currentFolder.type === 'type.folder.root.private';
		const isPublicRoot = this.currentFolder.type === 'type.folder.root.public';

		if (isPrivateRoot) {
			this.event.dispatch({
				action: 'open_private_workspace',
				entity: 'account',
			});
		}

		if (isPublicRoot) {
			this.event.dispatch({
				action: 'open_public_workspace',
				entity: 'account',
			});
		}
	}

	async ngOnChanges() {
		this.syncStateWithRouteandInput();
	}

	registerArchiveChangeHandlers() {
		// register for archive change events to reload the root section
		this.subscriptions.push(
			this.account.archiveChange.subscribe(async (archive) => {
				// may be in a subfolder we don't have access to, reload just the 'root'
				const url = this.router.url;
				const urlParts = url.split('/').slice(0, 3);
				const currentRoot = urlParts.join('/');
				if (currentRoot === url) {
					const timestamp = Date.now();
					const queryParams: any = {};
					queryParams[timestamp] = '';
					this.router.navigate(['.'], { queryParams, relativeTo: this.route });
				} else {
					this.router.navigateByUrl(currentRoot);
				}
			}),
		);
	}

	registerRouterEventHandlers() {
		// register for navigation events to reinit page on folder changes
		this.subscriptions.push(
			this.router.events
				.pipe(filter((event) => event instanceof NavigationEnd))
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
				}),
		);
	}

	registerDataServiceHandlers() {
		// register for folder update events
		this.subscriptions.push(
			this.dataService.folderUpdate.subscribe((folder: FolderVO) => {
				setTimeout(() => {
					this.loadVisibleItems();
				}, 500);
			}),
		);

		// register for multi select events
		this.subscriptions.push(
			this.dataService.multiSelectChange.subscribe((enabled) => {
				this.isMultiSelectEnabled = enabled;
			}),
		);

		// register for select events
		this.subscriptions.push(
			this.dataService.selectedItems$().subscribe((selectedItems) => {
				this.selectedItems = selectedItems;
			}),
		);

		// register for 'show item' events
		this.subscriptions.push(
			this.dataService.itemToShow$().subscribe((item) => {
				setTimeout(() => {
					this.scrollToItem(item);
				});
			}),
		);
	}

	registerDragServiceHandlers() {
		// register for drag events to scroll if needed
		if (this.drag) {
			this.subscriptions.push(
				this.drag.events().subscribe((dragEvent) => {
					switch (dragEvent.type) {
						case 'start':
						case 'end':
							this.isDraggingInProgress = dragEvent.type === 'start';
							break;
					}
				}),
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
					(event) => this.onViewportMouseMove(event),
				);
			});
		}
	}

	async refreshView() {
		await this.ngOnInit();
		setTimeout(() => {
			this.ngAfterViewInit();
		}, 1);
	}

	async ngOnInit() {
		await this.syncStateWithRouteandInput();
	}

	ngAfterViewInit() {
		if (this.listItemsQuery) {
			this.listItems = this.listItemsQuery.toArray();
		}

		this.registerMouseMoveHandler();

		this.loadVisibleItems(true);

		if (this.showSidebar) {
			this.getScrollElement().scrollTo(0, 0);
		}

		const queryParams = this.route.snapshot.queryParamMap;
		if (queryParams.has('showItem')) {
			const folderLinkId = Number(queryParams.get('showItem'));
			this.location.replaceState(this.router.url.split('?')[0]);
			const item = find(this.currentFolder.ChildItemVOs, {
				folder_linkId: folderLinkId,
			});
			this.scrollToItem(item);
			if (!this.device.isMobileWidth()) {
				setTimeout(() => {
					this.dataService.onSelectEvent({
						type: 'click',
						item,
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
		return (
			this.device.isMobileWidth() || !this.showSidebar
				? this.document.documentElement
				: this.scrollElement.nativeElement
		) as HTMLElement;
	}

	onViewportMouseMove(event: MouseEvent) {
		if (this.isDraggingInProgress && this.mouseMoveHandlerThrottled) {
			this.mouseMoveHandlerThrottled(event);
		}
	}

	scrollToItem(item: ItemVO) {
		this.debug('scroll to item %o', item);
		const folderLinkId = item.folder_linkId;
		const listItem = find(
			this.listItemsQuery.toArray(),
			(x) => x.item.folder_linkId === folderLinkId,
		);
		if (listItem) {
			const itemElem = listItem.element.nativeElement as HTMLElement;
			itemElem.scrollIntoView();
		}
	}

	checkDragScrolling(event: MouseEvent) {
		const scrollElem = this.scrollElement.nativeElement as HTMLElement;
		const bounds = scrollElem.getBoundingClientRect();
		const top = bounds.top;
		const bottom = top + bounds.height;
		const currentScrollTop = scrollElem.scrollTop;
		const currentScrollHeight = scrollElem.scrollHeight;
		const maxScrollTop = currentScrollHeight - bounds.height;

		if (top < event.clientY && event.clientY < top + DRAG_SCROLL_THRESHOLD) {
			if (currentScrollTop > 0) {
				let step = DRAG_SCROLL_STEP;
				if (event.clientY < top + DRAG_SCROLL_THRESHOLD / 2) {
					step = step * 3;
				}
				scrollElem.scrollBy({ left: 0, top: -step, behavior: 'smooth' });
				if (scrollElem.scrollTop > 0) {
					this.mouseMoveHandlerThrottled(event);
				}
			}
		} else if (
			bottom > event.clientY &&
			event.clientY > bottom - DRAG_SCROLL_THRESHOLD
		) {
			if (currentScrollTop < maxScrollTop) {
				let step = DRAG_SCROLL_STEP;
				if (event.clientY > maxScrollTop - DRAG_SCROLL_THRESHOLD / 2) {
					step = step * 3;
				}
				scrollElem.scrollBy({ left: 0, top: step, behavior: 'smooth' });
				if (scrollElem.scrollTop < maxScrollTop) {
					this.mouseMoveHandlerThrottled(event);
				}
			}
		}
	}

	onItemClick(itemClick: ItemClickEvent) {
		this.itemClicked.emit(itemClick);

		if (!this.showSidebar || !itemClick.selectable) {
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
					key: event.keyCode === UP_ARROW ? 'up' : 'down',
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
				modifierKey: 'ctrl',
			};

			this.dataService.onSelectEvent(selectEvent);
		}
	}

	checkKeyEvent(event: KeyboardEvent) {
		return (
			event.target === this.document.body && !this.router.url.includes('record')
		);
	}

	async loadVisibleItems(animate?: boolean) {
		this.debug('loadVisibleItems %d items', this.visibleItems.size);
		if (this.ephemeralFolder) {
			return;
		}
		if (!this.visibleItems.size) {
			return;
		}

		const visibleListItems = Array.from(this.visibleItems);
		this.visibleItems.clear();
		if (animate) {
			const targetElems = visibleListItems.map((c) => c.element.nativeElement);
			gsap.from(targetElems, 0.25, {
				duration: 0.25,
				opacity: 0,
				ease: 'Power4.easeOut',
				stagger: {
					amount: 0.015,
				},
			});
		}

		const itemsToFetch = visibleListItems.map((c) => c.item);
		if (itemsToFetch.length && !this.isUnlistedShare) {
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

	private async syncStateWithRouteandInput() {
		this.isUnlistedShare = await this.shareLinksService.isUnlistedShare();

		this.currentFolder =
			this.ephemeralFolder || this.route.snapshot.data.currentFolder;
		this.showSidebar = this.route.snapshot.data.showSidebar;
		this.dataService.setCurrentFolder(this.currentFolder);
		this.isRootFolder = this.currentFolder.type.includes('root');
		this.showFolderDescription = this.route.snapshot.data.showFolderDescription;

		this.visibleItems.clear();
		this.reinit = true;
	}
}
