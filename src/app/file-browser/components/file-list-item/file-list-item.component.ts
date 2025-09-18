import {
	Component,
	OnInit,
	Input,
	OnDestroy,
	ElementRef,
	HostBinding,
	OnChanges,
	Output,
	EventEmitter,
	Optional,
	Inject,
	ViewChild,
	AfterViewInit,
	DOCUMENT,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getFormattedDate } from '@shared/utilities/dateTime';
import { DataService } from '@shared/services/data/data.service';
import {
	PromptService,
	PromptButton,
	PromptField,
	FOLDER_VIEW_FIELD_INIIAL,
} from '@shared/services/prompt/prompt.service';
import {
	FolderVO,
	RecordVO,
	FolderVOData,
	RecordVOData,
	ShareVO,
	ItemVO,
} from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import { EditService } from '@core/services/edit/edit.service';
import {
	RecordResponse,
	FolderResponse,
	ShareResponse,
} from '@shared/services/api/index.repo';
import { Validators } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { FolderPickerOperations } from '@core/components/folder-picker/folder-picker.component';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { Deferred } from '@root/vendor/deferred';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { ApiService } from '@shared/services/api/api.service';
import { AccessRole } from '@models/access-role';
import { DeviceService } from '@shared/services/device/device.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import {
	DragService,
	DragServiceEvent,
	DragTargetType,
	DraggableComponent,
	DragTargetDroppableComponent,
} from '@shared/services/drag/drag.service';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';

import { ngIfFadeInAnimation } from '@shared/animations';
import { RouteData } from '@root/app/app.routes';
import { ThumbnailCache } from '@shared/utilities/thumbnail-cache/thumbnail-cache';
import { GetThumbnail } from '@models/get-thumbnail';
import { ItemClickEvent } from '../file-list/file-list.component';
import { SharingComponent } from '../sharing/sharing.component';
import { PublishComponent } from '../publish/publish.component';
import { EditTagsComponent } from '../edit-tags/edit-tags.component';

export const ItemActions: { [key: string]: PromptButton } = {
	Rename: {
		buttonName: 'rename',
		buttonText: 'Rename',
	},
	Copy: {
		buttonName: 'copy',
		buttonText: 'Copy',
	},
	Move: {
		buttonName: 'move',
		buttonText: 'Move',
	},
	Download: {
		buttonName: 'download',
		buttonText: 'Download',
	},
	Delete: {
		buttonName: 'delete',
		buttonText: 'Delete',
		class: 'btn-danger',
	},
	Share: {
		buttonName: 'share',
		buttonText: 'Share',
	},
	Unshare: {
		buttonName: 'unshare',
		buttonText: 'Remove',
		class: 'btn-danger',
	},
	Publish: {
		buttonName: 'publish',
		buttonText: 'Publish',
	},
	GetLink: {
		buttonName: 'publish',
		buttonText: 'Get link',
	},
	SetFolderView: {
		buttonName: 'setFolderView',
		buttonText: 'Set folder view',
	},
	Tags: {
		buttonName: 'tags',
		buttonText: 'Keywords',
	},
};

export enum FolderContentsType {
	NORMAL = '',
	EMPTY_FOLDER = 'folder_open',
	BROKEN_THUMBNAILS = 'folder',
	SUBFOLDERS = 'perm_media',
	MIXED_FILES = 'description',
}

type ActionType =
	| 'delete'
	| 'rename'
	| 'share'
	| 'unshare'
	| 'publish'
	| 'download'
	| 'copy'
	| 'move'
	| 'setFolderView'
	| 'tags';

export interface FileListItemVisibleEvent {
	visible: boolean;
	element: HTMLElement;
	component: FileListItemComponent;
}

const SINGLE_CLICK_DELAY = 100;
const DOUBLE_CLICK_TIMEOUT = 350;
const MOUSE_DOWN_DRAG_TIMEOUT = 500;
const DRAG_MIN_Y = 1;

@Component({
	selector: 'pr-file-list-item',
	templateUrl: './file-list-item.component.html',
	styleUrls: ['./file-list-item.component.scss'],
	animations: [ngIfFadeInAnimation],
	standalone: false,
})
export class FileListItemComponent
	implements
		OnInit,
		AfterViewInit,
		OnChanges,
		OnDestroy,
		HasSubscriptions,
		DraggableComponent,
		DragTargetDroppableComponent
{
	@Input() item: ItemVO;
	@Input() folderView: FolderView;

	@Input() allowNavigation = true;
	@Input() isShareRoot = false;
	@Input() multiSelect = false;
	@Input() isSelected = false;
	@Input() showAccess = false;
	@Input() canSelect = true;
	@Input() showFolderThumbnails = false;

	public isMultiSelected = false;
	public isDragTarget = false;
	public isDropTarget = false;
	public isDragging = false;
	public isDisabled = false;
	public isNameHovered = false;
	public isTextOverflowing = false;
	public isPublicArchive = false;

	@HostBinding('class.grid-view') inGridView = false;

	@Output() itemUnshared = new EventEmitter<ItemVO>();
	@Output() itemClicked = new EventEmitter<ItemClickEvent>();
	@Output() itemVisible = new EventEmitter<FileListItemVisibleEvent>();
	@Output() refreshView = new EventEmitter<void>();

	@ViewChild('name', { static: true }) name: ElementRef;

	public allowActions = true;
	public isMyItem = true;
	public canEdit = true;
	public isZip = false;
	public date: string = '';

	private folderThumb200: string;
	private folderThumb500: string;
	private folderContentsType: FolderContentsType = FolderContentsType.NORMAL;

	private isInShares: boolean;
	private isInApps: boolean;
	private isInPublic: boolean;
	private isInMyPublic: boolean;
	private isInPublicArchive: boolean;
	private isInSharePreview: boolean;
	private checkFolderView: boolean;

	private singleClickTimeout: ReturnType<typeof setTimeout>;
	private mouseDownDragTimeout: ReturnType<typeof setTimeout>;
	private waitingForDoubleClick = false;
	private touchStartEvent: TouchEvent;
	private isUnlistedShare = true;

	subscriptions: Subscription[] = [];

	constructor(
		private dataService: DataService,
		private api: ApiService,
		private router: Router,
		private route: ActivatedRoute,
		public element: ElementRef,
		private message: MessageService,
		private prompt: PromptService,
		@Optional() private edit: EditService,
		private accountService: AccountService,
		@Optional() private folderPicker: FolderPickerService,
		private dialog: DialogCdkService,
		private device: DeviceService,
		@Optional() private drag: DragService,
		private storage: StorageService,
		@Inject(DOCUMENT) private document: Document,
	) {}

	ngOnInit() {
		const date = new Date(this.item.displayDT);
		this.date = getFormattedDate(date);

		this.dataService.registerItem(this.item);
		if (this.item.type.includes('app')) {
			this.allowActions = false;
		}

		if (this.router.routerState.snapshot.url.includes('/p/')) {
			this.allowActions = false;
			this.isPublicArchive = true;
		}

		if (this.router.routerState.snapshot.url.includes('/share/')) {
			this.allowActions = false;
			this.isInSharePreview = true;
		}

		if (this.router.routerState.snapshot.url.includes('/apps')) {
			this.isInApps = true;
		}

		if (this.router.routerState.snapshot.url.includes('/public')) {
			this.isInMyPublic = true;
		}

		if (this.item.isFolder) {
			this.getFolderThumbnail();
		}

		const data = this.route.snapshot.data as RouteData;

		if (data.isPublic) {
			this.isInPublic = true;
		}

		if (data.isPublicArchive) {
			this.isInPublicArchive = true;
		}

		if (data.checkFolderViewOnNavigate) {
			this.checkFolderView = true;
		}

		if (this.router.routerState.snapshot.url.includes('/shares')) {
			this.isInShares = true;
			this.isMyItem =
				this.accountService.getArchive().archiveId === this.item.archiveId;
		}

		if (
			!this.accountService.checkMinimumAccess(
				this.item.accessRole,
				AccessRole.Editor,
			)
		) {
			this.canEdit = false;
		}

		this.inGridView = this.folderView === FolderView.Grid;

		this.isZip = this.item.type === 'type.record.archive';

		if (this.drag) {
			this.subscriptions.push(
				this.drag.events().subscribe((dragEvent) => {
					this.onDragServiceEvent(dragEvent);
				}),
			);
		}
	}

	ngAfterViewInit() {
		if (this.item.isNewlyCreated) {
			setTimeout(() => {
				this.item.isNewlyCreated = false;
			});
		}
		const nameContainer = this.name.nativeElement;
		this.isTextOverflowing =
			nameContainer.scrollWidth > nameContainer.clientWidth;
	}

	ngOnChanges() {
		this.inGridView = this.folderView === FolderView.Grid;

		if (!this.multiSelect) {
			this.isMultiSelected = false;
		}
	}

	ngOnDestroy() {
		this.dataService.unregisterItem(this.item);
		unsubscribeAll(this.subscriptions);
	}

	async onDrop(dropTarget: DragTargetDroppableComponent) {
		const destination = this.drag.getDestinationFromDropTarget(dropTarget);

		if (destination) {
			this.isDisabled = true;
			const selectedItems = this.dataService.getSelectedItems();
			const srcItemSelected = selectedItems.has(this.item);
			const multipleItemsSelected = selectedItems.size > 1;
			let itemsToMove: ItemVO[];
			let itemText: string;

			if (multipleItemsSelected && srcItemSelected) {
				itemsToMove = Array.from(selectedItems.keys());
				itemText = `${selectedItems.size} items`;
			} else {
				itemsToMove = [this.item];
				itemText = this.item.displayName;
			}

			try {
				await this.prompt.confirm(
					'Move',
					`Move ${itemText} to ${destination.displayName}?`,
				);
				await this.edit.moveItems(itemsToMove, destination);
			} catch (err) {
				this.isDisabled = false;
				if (err instanceof RecordResponse || err instanceof FolderResponse) {
					this.message.showError({ message: err.getMessage() });
				}
			}
		}
	}

	onDragServiceEvent(dragEvent: DragServiceEvent) {
		if (dragEvent.srcComponent === this) {
			return;
		}

		if (dragEvent.srcComponent instanceof FileListItemComponent) {
			const srcItem = dragEvent.srcComponent.item;
			const selectedItems = this.dataService.getSelectedItems();
			const srcItemSelected = selectedItems.has(srcItem);
			const multipleItemsSelected = selectedItems.size > 1;

			if (srcItemSelected && multipleItemsSelected && this.isSelected) {
				this.isDragging = dragEvent.type === 'start';
				return;
			}
		}

		switch (dragEvent.type) {
			case 'start':
			case 'end':
				const start = dragEvent.type === 'start';

				if (this.item.isRecord && dragEvent.targetTypes.includes('record')) {
					this.isDragTarget = start;
				}

				if (this.item.isFolder && dragEvent.targetTypes.includes('folder')) {
					this.isDragTarget = start;
				}

				if (!start) {
					this.isDropTarget = false;
				}

				break;
		}
	}

	onItemMouseDown(mouseDownEvent: MouseEvent) {
		if (this.isShareRoot || this.isInApps) {
			return;
		}

		// mouseDownEvent.preventDefault();
		const preDragMouseUpHandler = (mouseUpEvent: MouseEvent) => {
			clearTimeout(this.mouseDownDragTimeout);
		};

		this.document.addEventListener('mouseup', preDragMouseUpHandler);

		this.mouseDownDragTimeout = setTimeout(() => {
			this.document.removeEventListener('mouseup', preDragMouseUpHandler);
			const targetTypes: DragTargetType[] = ['folder'];

			// if (this.item.isRecord) {
			//   targetTypes.push('record');
			// }

			let isDragging = false;
			const mouseUpHandler = (mouseUpEvent: MouseEvent) => {
				this.drag.dispatch({
					type: 'end',
					srcComponent: this,
					event: mouseUpEvent,
					targetTypes,
				});
				this.document.removeEventListener('mouseup', mouseUpHandler);
				setTimeout(() => {
					this.isDragging = false;
				});
			};
			const mouseMoveHandler = (mouseMoveEvent: MouseEvent) => {
				mouseMoveEvent.preventDefault();
				if (!isDragging) {
					isDragging =
						Math.abs(mouseMoveEvent.clientY - mouseDownEvent.clientY) >
						DRAG_MIN_Y;
					if (isDragging) {
						this.drag.dispatch({
							type: 'start',
							srcComponent: this,
							event: mouseMoveEvent,
							targetTypes,
						});
						this.isDragging = true;
						this.document.addEventListener('mouseup', mouseUpHandler);
						this.document.removeEventListener('mousemove', mouseMoveHandler);
					}
				}
			};
			this.document.addEventListener('mousemove', mouseMoveHandler);
		}, MOUSE_DOWN_DRAG_TIMEOUT);
	}

	onItemMouseEnterLeave(event: MouseEvent, enter = true) {
		if (this.isDragTarget) {
			let type;
			if (enter) {
				type = 'enter';
			} else {
				type = 'leave';
			}
			this.drag.dispatch(
				{
					type,
					srcComponent: this,
					event,
				},
				event.type === 'dragenter' ? 1 : 0,
			);
			this.isDropTarget = enter;
		}
	}

	showUnlistedPreview() {
		if(this.router.routerState.snapshot.url.includes('/share/')) {
			this.goToItem();
			// this.itemClicked.emit({
			// 	item: this.item,
			// 	event: event as MouseEvent,
			// 	selectable: false,
			// });
			return;
		}
	}

	onItemClick(event: MouseEvent) {
		if(this.router.routerState.snapshot.url.includes('/share/')) {
			return;
		}
		if (this.device.isMobileWidth() || !this.canSelect) {
			this.goToItem();
			this.itemClicked.emit({
				item: this.item,
				event: event as MouseEvent,
				selectable: false,
			});
		} else {
			this.onItemSingleClick(event);
		}
	}

	onItemDoubleClick() {
		if (this.singleClickTimeout) {
			clearTimeout(this.singleClickTimeout);
			this.singleClickTimeout = null;
		}

		this.goToItem();
	}

	async goToItem() {
		if (!this.allowNavigation && !this.router.routerState.snapshot.url.includes('/share/')) {
			return false;
		}

		if (this.multiSelect) {
			this.isMultiSelected = !this.isMultiSelected;
			this.onMultiSelectChange();
			return;
		}

		// if (this.item.dataStatus < DataStatus.Lean) {
		// 	this.dataService.beginPreparingForNavigate();
		// 	if (!this.item.isFetching) {
		// 		this.dataService.fetchLeanItems([this.item]);
		// 	}

		// 	return await this.item.fetched.then((fetched) => {
		// 		this.goToItem();
		// 	});
		// }

		let rootUrl;

		if (this.isInApps) {
			rootUrl = '/apps';
		} else if (this.isInShares && !this.isMyItem) {
			rootUrl = '/shares';
		} else if (this.isInSharePreview) {
			rootUrl = '/share';
		} else if (this.isInPublic) {
			rootUrl = '/p';
		} else if (this.router.routerState.snapshot.url.includes('/public')) {
			rootUrl = '/public';
		} else {
			rootUrl = '/private';
		}

		if (this.item.isFolder) {
			if (this.checkFolderView && this.isFolderViewSet()) {
				this.router.navigate([
					rootUrl,
					'view',
					this.getFolderViewUrl(),
					this.item.archiveNbr,
					this.item.folder_linkId,
				]);
			} else if (this.isInPublic && !this.isInPublicArchive) {
				this.router.navigate([this.item.archiveNbr, this.item.folder_linkId], {
					relativeTo: this.route.parent.parent,
				});
			}
			if (this.isInSharePreview || this.isInPublicArchive) {
				this.router.navigate([this.item.archiveNbr, this.item.folder_linkId], {
					relativeTo: this.route.parent,
				});
			} else {
				this.router.navigate([
					rootUrl,
					this.item.archiveNbr,
					this.item.folder_linkId,
				]);
			}
		} else if (
			!this.isInSharePreview &&
			!this.isMyItem &&
			this.dataService.currentFolder.type === 'type.folder.root.share'
		) {
			this.router.navigate(['/shares/record', this.item.archiveNbr]);
		} else if(this.isUnlistedShare) {
			this.router.navigate(['view/record', this.item.archiveNbr], {
				relativeTo: this.route,
			});
		} else {
			this.router.navigate(['record', this.item.archiveNbr], {
				relativeTo: this.route,
			});
		}
	}

	onItemSingleClick(event: MouseEvent | TouchEvent) {
		if (this.isDragging) {
			return;
		}

		if (this.waitingForDoubleClick) {
			this.waitingForDoubleClick = false;
			return this.onItemDoubleClick();
		}

		this.waitingForDoubleClick = true;
		this.singleClickTimeout = setTimeout(() => {
			this.itemClicked.emit({
				item: this.item,
				event: event as MouseEvent,
				selectable: true,
			});
		}, SINGLE_CLICK_DELAY);

		setTimeout(() => {
			this.waitingForDoubleClick = false;
		}, DOUBLE_CLICK_TIMEOUT);
	}

	onItemTouchStart(event) {
		this.touchStartEvent = event;
	}

	onItemTouchEnd(event) {
		if (!this.touchStartEvent) {
			return;
		}

		if (
			(event.target as HTMLElement).classList.contains(
				'right-menu-toggler-icon',
			)
		) {
			this.touchStartEvent = null;
			return;
		}

		// don't trigger click from scroll...
		const startX = this.touchStartEvent.touches.item(0).clientX;
		const endX = (event as TouchEvent).changedTouches.item(0).clientX;
		const startY = this.touchStartEvent.touches.item(0).clientY;
		const endY = (event as TouchEvent).changedTouches.item(0).clientY;
		const distance = Math.sqrt(
			Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2),
		);

		if (distance > 15) {
			return;
		}

		event.preventDefault();
		this.touchStartEvent = null;

		this.onItemClick(event);
	}

	isFolderViewSet() {
		if (!this.item.isFolder) {
			return false;
		}

		switch (this.item.view) {
			case FolderView.Timeline:
				return true;
			default:
				return false;
		}
	}

	getFolderViewUrl() {
		switch (this.item.view) {
			case FolderView.Timeline:
				return 'timeline';
			default:
				return false;
		}
	}

	showActions(event: Event) {
		event.preventDefault();
		event.stopPropagation();

		const actionButtons: PromptButton[] = [];

		const actionDeferred = new Deferred();

		const isAtLeastCurator = this.accountService.checkMinimumAccess(
			this.item.accessRole,
			AccessRole.Curator,
		);
		const isOwner = this.accountService.checkMinimumAccess(
			this.item.accessRole,
			AccessRole.Owner,
		);

		if (this.canEdit) {
			actionButtons.push(ItemActions.Rename);

			if (isAtLeastCurator) {
				actionButtons.push(ItemActions.Copy);

				if (!this.isShareRoot) {
					actionButtons.push(ItemActions.Move);
				}
			}

			if (isOwner && !this.isInMyPublic) {
				actionButtons.push(ItemActions.Share);
			}

			if (!this.isInShares) {
				if (this.isInMyPublic) {
					actionButtons.push(ItemActions.GetLink);

					if (this.item.isFolder) {
						actionButtons.push(ItemActions.SetFolderView);
					}
				} else if (isOwner) {
					actionButtons.push(ItemActions.Publish);
				}
			}

			actionButtons.push(ItemActions.Tags);

			if (this.item.isRecord) {
				actionButtons.push(ItemActions.Download);
			}
		}

		if (!this.isShareRoot && isAtLeastCurator) {
			actionButtons.push(ItemActions.Delete);
		} else if (
			this.isShareRoot &&
			!this.isMyItem &&
			this.accountService.checkMinimumArchiveAccess(AccessRole.Curator)
		) {
			actionButtons.push(ItemActions.Unshare);
		}

		if (actionButtons.length) {
			this.prompt
				.promptButtons(
					actionButtons,
					this.item.displayName,
					actionDeferred.promise,
				)
				.then((value: ActionType) => {
					this.onActionClick(value, actionDeferred);
				})
				.catch();
		} else {
			try {
				this.prompt.confirm(
					'OK',
					this.item.displayName,
					null,
					null,
					`<p>No actions available</p>`,
				);
			} catch (err) {}
		}

		return false;
	}

	async onActionClick(value: ActionType, actionDeferred: Deferred) {
		switch (value) {
			case 'delete':
				return await this.deleteItem(actionDeferred.resolve);
			case 'rename':
				actionDeferred.resolve();
				this.promptForUpdate();
				break;
			case 'move':
				actionDeferred.resolve();
				this.openFolderPicker(FolderPickerOperations.Move);
				break;
			case 'copy':
				actionDeferred.resolve();
				this.openFolderPicker(FolderPickerOperations.Copy);
				break;
			case 'download':
				this.dataService.downloadFile(this.item as RecordVO).then(() => {
					actionDeferred.resolve();
				});
				break;
			case 'share':
				this.api.share
					.getShareLink(this.item)
					.then((response: ShareResponse) => {
						actionDeferred.resolve();
						this.dialog.open(SharingComponent, {
							data: {
								item: this.item,
								link: response.getShareByUrlVO(),
							},
						});
					});
				break;
			case 'unshare':
				await this.unshareItem();
				actionDeferred.resolve();
				break;
			case 'publish':
				actionDeferred.resolve();
				this.dialog.open(PublishComponent, {
					data: { item: this.item },
					height: 'auto',
				});
				break;
			case 'tags':
				actionDeferred.resolve();
				this.dialog.open(EditTagsComponent, {
					data: { item: this.item },
					height: 'auto',
				});
				break;
			case 'setFolderView':
				actionDeferred.resolve();
				this.promptForFolderView();
				break;
		}
	}

	preventDefault(event: Event) {
		event.stopPropagation();
	}

	async deleteItem(resolve: Function) {
		const size = this.getFileOrFolderSize();
		return await this.edit
			.deleteItems([this.item])
			.then(() => {
				this.accountService.deductAccountStorage(-size);
				this.dataService.refreshCurrentFolder();
				resolve();
			})
			.catch(() => {
				resolve();
			});
	}

	getFileOrFolderSize(): number {
		let size = 0;
		if (this.item instanceof FolderVO) {
			this.api.folder.get([this.item]).then((response: FolderResponse) => {
				const folder = response.getFolderVO();
				size = folder.FolderSizeVO.allFileSizeDeep;
			});
		} else {
			size = this.item.size;
		}
		return size;
	}

	async moveItem(destination: FolderVO) {
		return await this.edit.moveItems([this.item], destination);
	}

	async copyItem(destination: FolderVO) {
		return await this.edit.copyItems([this.item], destination);
	}

	async unshareItem() {
		const shareVO = new ShareVO({
			folder_linkId: this.item.folder_linkId,
			archiveId: this.accountService.getArchive().archiveId,
		});
		await this.api.share.remove(shareVO);
		this.message.showMessage({
			message: 'Item removed from shares.',
			style: 'success',
		});
		this.itemUnshared.emit(this.item);
	}

	openFolderPicker(operation: FolderPickerOperations) {
		if (!this.folderPicker) {
			return false;
		}

		const deferred = new Deferred();
		const rootFolder = this.accountService.getRootFolder();

		this.folderPicker
			.chooseFolder(rootFolder, operation, deferred.promise)
			.then(async (destination: FolderVO) => {
				switch (operation) {
					case FolderPickerOperations.Copy:
						return await this.copyItem(destination);
					case FolderPickerOperations.Move:
						return await this.moveItem(destination);
				}
			})
			.then(() => {
				setTimeout(() => {
					deferred.resolve();
					const message = `${this.item.isFolder ? 'Folder' : 'File'} ${
						this.item.displayName
					} ${
						operation === FolderPickerOperations.Copy ? 'copied' : 'moved'
					} successfully.`;
					this.message.showMessage({ message, style: 'success' });
					if (operation === FolderPickerOperations.Move || this.item.isFolder) {
						this.dataService.refreshCurrentFolder();
					}
					this.refreshView.emit();
				}, 500);
			})
			.catch((response: FolderResponse | RecordResponse) => {
				deferred.reject();
				this.message.showError({
					message: response.getMessage(),
					translate: true,
				});
			});
	}

	async promptForUpdate() {
		const updateDeferred = new Deferred();

		const fields: PromptField[] = [
			{
				fieldName: 'displayName',
				validators: [Validators.required],
				placeholder: 'Name',
				initialValue: this.item.displayName,
				config: {
					autocapitalize: 'off',
					autocorrect: 'off',
					autocomplete: 'off',
					spellcheck: 'off',
					autoselect: true,
				},
			},
		];

		try {
			const values = await this.prompt.prompt(
				fields,
				`Rename "${this.item.displayName}"`,
				updateDeferred.promise,
				'Rename',
				'Cancel',
			);
			this.saveUpdates(values, updateDeferred);
		} catch (err) {
			if (err) {
				throw err;
			}
		}
	}

	promptForFolderView() {
		const updateDeferred = new Deferred();

		const fields = [FOLDER_VIEW_FIELD_INIIAL(this.item.view)];

		this.prompt
			.prompt(
				fields,
				`Set folder view for "${this.item.displayName}"`,
				updateDeferred.promise,
				'Save',
				'Cancel',
			)
			.then((values) => {
				this.saveUpdates(values, updateDeferred);
			})
			.catch();
	}

	saveUpdates(changes: RecordVOData | FolderVOData, deferred: Deferred) {
		const originalData = {};
		Object.keys(changes).forEach((key) => {
			if (this.item[key] === changes[key]) {
				delete changes[key];
			} else {
				originalData[key] = this.item[key];
			}
		});

		if (!Object.keys(changes).length) {
			return deferred.resolve();
		} else {
			this.item.update(changes);
			return this.edit
				.updateItems([this.item])
				.then(() => {
					deferred.resolve();
				})
				.catch((response: RecordResponse | FolderResponse) => {
					deferred.reject();
					this.item.update(originalData);
					if (response.getMessage) {
						this.message.showError({
							message: response.getMessage(),
							translate: true,
						});
					}
				});
		}
	}

	onMultiSelectChange() {
		this.dataService.setItemMultiSelectStatus(this.item, this.isMultiSelected);
	}

	onIntersection({ target, visible }: { target: Element; visible: boolean }) {
		if (this.item.dataStatus > DataStatus.Placeholder || this.item.isFetching) {
			return;
		}

		this.itemVisible.emit({
			visible,
			component: this,
			element: this.element.nativeElement as HTMLElement,
		});
	}

	private getFolderThumbnail(): void {
		if (!this.showFolderThumbnails) {
			this.folderContentsType = FolderContentsType.BROKEN_THUMBNAILS;
			return;
		}
		const sortPriorities = [
			'type.record.image',
			'type.record.video',
			'type.record.presentation',
			'type.record.pdf',
		];

		const calculateSortPriority = (item: ItemVO): number => {
			const priority = sortPriorities.indexOf(item.type);
			if (priority < 0) {
				return Infinity;
			}
			return priority;
		};

		const cache = new ThumbnailCache(this.storage);

		if (cache.hasThumbnail(this.item)) {
			const thumbs = cache.getThumbnail(this.item);
			this.folderContentsType = thumbs.folderContentsType;
			this.folderThumb200 = thumbs.folderThumb200;
			this.folderThumb500 = thumbs.folderThumb500;
		} else {
			this.api.folder
				.getWithChildren([this.item as FolderVO])
				.then((resp) => {
					if (resp.isSuccessful) {
						const newFolderVO = resp.Results[0].data[0].FolderVO as FolderVO;
						const allChildren = newFolderVO.ChildItemVOs;
						const sortedItems = newFolderVO.ChildItemVOs.filter((item) =>
							item.type.includes('type.record'),
						);
						sortedItems.sort(
							(a, b) => calculateSortPriority(a) - calculateSortPriority(b),
						);
						const thumbnailItem = sortedItems.shift();
						if (thumbnailItem) {
							if (sortPriorities.includes(thumbnailItem.type)) {
								if (
									GetThumbnail(thumbnailItem, 200) &&
									GetThumbnail(thumbnailItem, 500)
								) {
									this.folderThumb200 = GetThumbnail(thumbnailItem, 200);
									this.folderThumb500 = GetThumbnail(thumbnailItem, 500);
								} else {
									this.folderContentsType =
										FolderContentsType.BROKEN_THUMBNAILS;
								}
							} else {
								this.folderContentsType = FolderContentsType.MIXED_FILES;
							}
						} else {
							if (allChildren.length === 0) {
								this.folderContentsType = FolderContentsType.EMPTY_FOLDER;
							} else {
								this.folderContentsType = FolderContentsType.SUBFOLDERS;
							}
						}
					} else {
						this.folderContentsType = FolderContentsType.BROKEN_THUMBNAILS;
					}
				})
				.catch((err) => {
					this.folderContentsType = FolderContentsType.BROKEN_THUMBNAILS;
				})
				.finally(() => {
					cache.saveThumbnail(this.item, {
						folderThumb200: this.folderThumb200,
						folderThumb500: this.folderThumb500,
						folderContentsType: this.folderContentsType,
					});
				});
		}
	}

	private getThumbnailPath(): string {
		if (this.showFolderIcon()) {
			return '';
		}
		if (this.item.isFolder) {
			if (this.folderThumb200 || this.folderThumb500) {
				return this.inGridView ? this.folderThumb500 : this.folderThumb200;
			} else {
				// Do not display default fallback thumbs
				return '';
			}
		} else {
			return GetThumbnail(this.item, 500);
		}
	}

	private showFolderIcon(): boolean {
		return (
			this.item.isFolder &&
			this.folderContentsType !== FolderContentsType.NORMAL
		);
	}

	public onMouseOverName() {
		this.isNameHovered = true;
	}

	public onMouseLeaveName() {
		this.isNameHovered = false;
	}
}
