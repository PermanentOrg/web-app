import {
	Component,
	OnDestroy,
	EventEmitter,
	Output,
	Input,
	Optional,
	HostListener,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { Subscription, Subject } from 'rxjs';
import { min } from 'lodash';
import { AccountService } from '@shared/services/account/account.service';
import { ItemVO, AccessRole, SortType, RecordVO } from '@models';
import { getAccessAsEnum } from '@models/access-role';
import { ngIfFadeInAnimation } from '@shared/animations';
import { EditService } from '@core/services/edit/edit.service';
import { ApiService } from '@shared/services/api/api.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { BaseResponse } from '@shared/services/api/base';
import { MessageService } from '@shared/services/message/message.service';
import { FolderPickerOperations } from '@core/components/folder-picker/folder-picker.component';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';
import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { isKeyEventFromBody } from '@shared/utilities/events';
import debug from 'debug';
import { EventService } from '@shared/services/event/event.service';

interface FileListActions {
	delete: boolean;
	copy: boolean;
	move: boolean;
	share: boolean;
	publish: boolean;
	download: boolean;
	unshare: boolean;
}

interface Format {
	name: string;
	extension: string;
}

type FileListColumn = 'name' | 'date' | 'type';

@Component({
	selector: 'pr-file-list-controls',
	templateUrl: './file-list-controls.component.html',
	styleUrls: ['./file-list-controls.component.scss'],
	animations: [ngIfFadeInAnimation],
	standalone: false,
})
export class FileListControlsComponent implements OnDestroy, HasSubscriptions {
	public isSorting$ = new Subject<boolean>();

	@Input() allowSort = true;
	@Input() showAccess = false;

	@Output() refreshView = new EventEmitter<void>();

	currentFolderView: FolderView;
	views = {
		list: FolderView.List,
		grid: FolderView.Grid,
		timeline: FolderView.Timeline,
	};

	currentSort: FileListColumn;
	sortDesc = false;

	isShareRoot = false;
	isPublic = false;

	isSavingSort = false;
	isSorting = false;
	canSaveSort = false;
	displayDownloadDropdown = false;

	downloadOptions: Format[] = [];

	@ViewChild('downloadButton') downloadButton: ElementRef;

	can: FileListActions = {
		delete: false,
		copy: false,
		move: false,
		share: false,
		publish: false,
		download: false,
		unshare: false,
	};

	subscriptions: Subscription[] = [];
	selectedItems: ItemVO[] = [];

	initialSortType: SortType;

	private debug = debug('component:fileListControls');
	constructor(
		private data: DataService,
		private prompt: PromptService,
		@Optional() private edit: EditService,
		private message: MessageService,
		private account: AccountService,
		private api: ApiService,
		private folderView: FolderViewService,
		private event: EventService,
	) {
		this.getSortFromCurrentFolder();
		this.initialSortType = this.data.currentFolder?.sort;
		this.subscriptions.push(
			this.data.selectedItems$().subscribe((items) => {
				this.selectedItems = Array.from(items);
				this.setAvailableActions();
			}),
		);

		this.canSaveSort = this.account.checkMinimumAccess(
			this.data.currentFolder?.accessRole,
			AccessRole.Curator,
		);

		this.currentFolderView = this.folderView.folderView;
		this.subscriptions.push(
			this.folderView.viewChange.subscribe((view) => {
				this.currentFolderView = view;
			}),
		);
	}

	ngOnDestroy() {
		unsubscribeAll(this.subscriptions);
	}

	@HostListener('document:click', ['$event'])
	handleClickOutside(event) {
		const clickedElement = event.target as HTMLElement;
		const isClickedInside =
			this.downloadButton.nativeElement.contains(clickedElement);
		if (!isClickedInside && this.displayDownloadDropdown) {
			this.displayDownloadDropdown = false;
		}
	}

	@HostListener('window:keydown.delete', ['$event'])
	onWindowKeydownDelete(event: KeyboardEvent) {
		if (isKeyEventFromBody(event) && this.selectedItems.length) {
			this.debug('keyboard shortcut delete');
			this.onDeleteClick();
		}
	}

	setAvailableActions() {
		this.isShareRoot =
			this.data.currentFolder.type === 'type.folder.root.share';
		this.isPublic = this.data.currentFolder.type.includes('public');
		this.setAllActions(false);

		const isSingleItem = this.selectedItems.length === 1;

		if (!this.selectedItems.length || !this.edit) {
			return this.setAllActions(false);
		}

		this.can.download = true;

		if (this.isPublic) {
			this.can.publish = true;
		}

		if (!this.account.checkMinimumArchiveAccess(AccessRole.Curator)) {
			return;
		}

		const minimumAccess = min([
			...this.selectedItems.map((i) => getAccessAsEnum(i.accessRole)),
			getAccessAsEnum(this.account.getArchive().accessRole),
		]);

		this.debug('minimum access for items & archive: %o', minimumAccess);

		switch (minimumAccess) {
			case AccessRole.Viewer:
			case AccessRole.Editor:
			case AccessRole.Contributor:
				if (this.isShareRoot && isSingleItem) {
					return (this.can.unshare = true);
				}
				return;
			case AccessRole.Curator:
				if (this.isShareRoot && isSingleItem) {
					return this.setMultipleActions(['unshare', 'copy', 'move'], true);
				} else {
					return this.setMultipleActions(['delete', 'copy', 'move'], true);
				}
			case AccessRole.Manager:
			case AccessRole.Owner:
				if (this.isShareRoot && isSingleItem) {
					return this.setMultipleActions(
						['unshare', 'copy', 'move', 'share'],
						true,
					);
				} else if (isSingleItem) {
					if (this.isPublic) {
						return this.setMultipleActions(
							['delete', 'copy', 'move', 'publish'],
							true,
						);
					} else {
						return this.setMultipleActions(
							['delete', 'copy', 'move', 'share', 'publish'],
							true,
						);
					}
				} else {
					return this.setMultipleActions(['delete', 'copy', 'move'], true);
				}
		}
	}

	setAllActions(enabled: boolean) {
		this.setMultipleActions(
			['delete', 'copy', 'move', 'share', 'publish', 'download'],
			enabled,
		);
	}

	setMultipleActions(actions: (keyof FileListActions)[], enabled: boolean) {
		for (const action of actions) {
			this.can[action] = enabled;
		}
	}

	getSortFromCurrentFolder() {
		const sort = this.data.currentFolder?.sort;
		if (!sort || sort.includes('alpha')) {
			this.currentSort = 'name';
		} else if (sort.includes('type')) {
			this.currentSort = 'type';
		} else if (sort.includes('display_date')) {
			this.currentSort = 'date';
		} else {
			this.currentSort = 'name';
		}

		this.sortDesc = sort && sort.includes('desc');
	}

	onSortClick(column: FileListColumn) {
		let desc = false;
		if (this.currentSort === column) {
			desc = !this.sortDesc;
		}

		let sortType: SortType;

		switch (column) {
			case 'name':
				sortType = desc ? 'sort.alphabetical_desc' : 'sort.alphabetical_asc';
				break;
			case 'type':
				sortType = desc ? 'sort.type_desc' : 'sort.type_asc';
				break;
			case 'date':
				sortType = desc ? 'sort.display_date_desc' : 'sort.display_date_asc';
				break;
		}

		this.setSort(sortType);
	}

	isSortChanged() {
		return this.initialSortType !== this.data.currentFolder?.sort;
	}

	async setSort(sort: SortType) {
		if (this.isSorting) {
			return;
		}

		this.isSorting = true;
		const originalSort = this.data.currentFolder.sort;
		this.data.currentFolder.update({ sort });
		this.getSortFromCurrentFolder();
		try {
			this.isSorting$.next(true);
			await this.data.refreshCurrentFolder(true);
		} catch (err) {
			this.data.currentFolder.update({ sort: originalSort });
			this.getSortFromCurrentFolder();
			throw err;
		} finally {
			this.isSorting = false;
			this.isSorting$.next(false);
		}
	}

	async saveSort() {
		if (this.isSavingSort) {
			return;
		}

		try {
			this.isSavingSort = true;
			await this.api.folder.sort([this.data.currentFolder]);
			this.initialSortType = this.data.currentFolder.sort;
		} finally {
			this.isSavingSort = false;
		}
	}

	async onDeleteClick() {
		if (!this.can.delete || !this.edit) {
			return;
		}

		const itemLabel =
			this.selectedItems.length > 1
				? `${this.selectedItems.length} items`
				: this.selectedItems[0].displayName;
		if (
			await this.prompt.confirmBoolean(
				'Delete',
				`Are you sure you want to delete ${itemLabel}?`,
			)
		) {
			try {
				this.edit.deleteItems(this.selectedItems);
				const sizeOfDeletedFiles = this.selectedItems.reduce(
					(acc, item) =>
						acc +
						(item instanceof RecordVO
							? item.size
							: item.FolderSizeVO.allFileSizeDeep),
					0,
				);
				this.account.deductAccountStorage(-sizeOfDeletedFiles);
			} catch (err) {
				if (err instanceof BaseResponse) {
					this.message.showError({
						message: err.getMessage(),
						translate: true,
					});
				}
			}
		}
	}

	async onUnshareClick() {
		if (!this.can.unshare || !this.edit || this.selectedItems.length !== 1) {
			return;
		}

		if (
			await this.prompt.confirmBoolean(
				'Unshare',
				'Are you sure you wish to remove this from your shared items?',
			)
		) {
			try {
				this.edit.unshareItem(this.selectedItems[0]);
			} catch (err) {
				if (err instanceof BaseResponse) {
					this.message.showError({
						message: err.getMessage(),
						translate: true,
					});
				}
			}
		}
	}

	async onMoveClick() {
		if (!this.can.move || !this.edit) {
			return;
		}
		await this.edit.openFolderPicker(
			this.selectedItems,
			FolderPickerOperations.Move,
		);
		this.refreshView.emit();
	}

	async onCopyClick() {
		if (!this.can.copy || !this.edit) {
			return;
		}

		await this.edit.openFolderPicker(
			this.selectedItems,
			FolderPickerOperations.Copy,
		);
		this.refreshView.emit();
	}

	onShareClick() {
		if (!this.can.share || !this.edit) {
			return;
		}

		this.event.dispatch({
			action: 'open_share_modal',
			entity: 'account',
		});

		this.edit.openShareDialog(this.selectedItems[0]);
	}

	onPublishClick() {
		if (!this.can.publish || !this.edit) {
			return;
		}

		this.edit.openPublishDialog(this.selectedItems[0]);
	}

	async onDownloadClick() {
		if (!this.can.download) {
			return;
		}

		if (
			this.selectedItems.length === 1 &&
			this.selectedItems[0] instanceof RecordVO
		) {
			if (this.displayDownloadDropdown) {
				this.displayDownloadDropdown = false;
				this.downloadOptions = [];
			} else {
				this.displayDownloadOptions();
			}
		} else {
			try {
				await this.data.createZipForDownload(this.selectedItems);
				this.message.showMessage({
					message:
						'Your zip file is being created. An in-app notification will let you know when it is ready to download.',
					style: 'success',
				});
			} catch (err) {
				this.message.showError({
					message: 'There was a problem creating a zip file to download',
					translate: false,
				});
			}
		}
	}

	async onFileTypeClick(fileName: string) {
		if (
			this.selectedItems.length === 1 &&
			this.selectedItems[0] instanceof RecordVO
		)
			this.data.downloadFile(this.selectedItems[0], fileName);
	}

	getTooltipConstantForAction(action: keyof FileListActions) {
		const basePath = 'fileList.actions';
		const actionAllowed = this.can[action];
		const multiSelected = this.selectedItems?.length > 1;
		const noneSelected = this.selectedItems?.length === 0;

		if (action === 'publish' && this.isPublic) {
			action = 'getLink' as keyof FileListActions;
		}

		let tooltipKey: string = action;

		if (action === 'publish' && this.isPublic) {
			tooltipKey = 'getLink';
		}

		if (actionAllowed) {
			return `${basePath}.${tooltipKey}.enabled`;
		} else if (multiSelected && (action === 'share' || action === 'publish')) {
			return `${basePath}.${tooltipKey}.disabledMulti`;
		} else if (noneSelected) {
			return '';
		} else {
			return `${basePath}.${tooltipKey}.disabled`;
		}
	}

	getTooltipConstantForSort(column: FileListColumn) {
		let direction = 'asc';
		if (this.currentSort === column && !this.sortDesc) {
			direction = 'desc';
		}
		return `fileList.sort.${column}.${direction}`;
	}

	displayDownloadOptions() {
		this.displayDownloadDropdown = true;
		this.downloadOptions = (
			this.selectedItems[0] as RecordVO
		).getDownloadOptionsList();
	}
}
