import { Injectable, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { remove, find, findIndex } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import {
	FolderVO,
	RecordVO,
	ItemVO,
	FolderVOData,
	RecordVOData,
} from '@root/app/models';
import { DataStatus } from '@models/data-status.enum';
import {
	FolderResponse,
	RecordResponse,
} from '@shared/services/api/index.repo';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import debug from 'debug';
import { debugSubscribable } from '@shared/utilities/debug';
import { TagsService } from '@core/services/tags/tags.service';

const THUMBNAIL_REFRESH_INTERVAL = 3000;

export type SelectedItemsSet = Set<ItemVO>;

export interface SelectKeyEvent {
	type: 'key';
	key?: 'up' | 'down' | 'a';
	modifierKey?: 'ctrl' | 'shift';
}

export interface SelectClickEvent {
	type: 'click';
	item: RecordVO | FolderVO;
	modifierKey?: 'ctrl' | 'shift';
}

export type SelectEvent = SelectClickEvent | SelectKeyEvent;

@Injectable()
export class DataService {
	public currentFolder: FolderVO;
	public currentFolderChange: EventEmitter<FolderVO> =
		new EventEmitter<FolderVO>();

	public showBreadcrumbs = true;
	public showPublicArchiveDescription = true;
	public publicCta: 'timeline';

	public folderUpdate: EventEmitter<FolderVO> = new EventEmitter<FolderVO>();

	public multiSelectEnabled = false;
	public multiSelectChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	private byFolderLinkId: { [key: number]: ItemVO } = {};
	private byArchiveNbr: { [key: string]: ItemVO } = {};
	private thumbRefreshQueue: Array<ItemVO> = [];
	private thumbRefreshTimeout;

	public multiclickItems: Map<number, ItemVO> = new Map();

	private selectedItems: SelectedItemsSet = new Set();
	private selectedItemsSubject: BehaviorSubject<SelectedItemsSet> =
		new BehaviorSubject(this.selectedItems);
	private lastManualclickItem: ItemVO;
	private lastArrowclickItem: ItemVO;

	private showItemSubject = new Subject<ItemVO>();
	private itemToShowAfterNavigate: ItemVO;

	private currentHiddenItems: ItemVO[] = [];

	private unsharedItemSubject = new Subject<ItemVO>();

	private eventSubject: Subject<boolean> = new Subject<boolean>();
	public events: Observable<boolean> = this.eventSubject.asObservable();

	private debug = debug('service:dataService');

	constructor(
		private api: ApiService,
		private tags: TagsService,
	) {
		debugSubscribable(
			'currentFolderChange',
			this.debug,
			this.currentFolderChange,
		);
		debugSubscribable('folderUpdate', this.debug, this.folderUpdate);
		debugSubscribable('selectedItems', this.debug, this.selectedItems$());
		debugSubscribable('showItem', this.debug, this.itemToShow$());
	}

	public registerItem(item: ItemVO) {
		this.byFolderLinkId[item.folder_linkId] = item;
		if (item.archiveNbr) {
			this.byArchiveNbr[item.archiveNbr] = item;
		}
	}

	public unregisterItem(item: ItemVO) {
		delete this.byFolderLinkId[item.folder_linkId];
		if (item.archiveNbr) {
			delete this.byArchiveNbr[item.archiveNbr];
		}
	}

	public setCurrentFolder(folder?: FolderVO, isPage?: boolean) {
		if (folder === this.currentFolder) {
			return;
		}

		this.currentFolder = folder;
		this.currentFolderChange.emit(folder);

		this.currentHiddenItems = [];

		this.clearSelectedItems();

		clearTimeout(this.thumbRefreshTimeout);
		this.thumbRefreshQueue = [];

		if (this.currentFolder && !isPage) {
			this.scheduleMissingThumbsCheck();
		}
	}

	public hideItemsInCurrentFolder(items: Array<ItemVO> = []) {
		this.currentHiddenItems = this.currentHiddenItems.concat(items);
		this.debug('hideItemsInCurrentFolder %d requested', items.length);
		const itemsInFolder = this.currentHiddenItems.filter(
			(i) => i.parentFolder_linkId === this.currentFolder.folder_linkId,
		);

		if (!itemsInFolder.length) {
			this.debug(
				'hideItemsInCurrentFolder no items match current folder',
				this.currentHiddenItems.length,
			);
			return;
		}

		const hiddenFolderLinkIds = new Set<number>();
		for (const item of itemsInFolder) {
			hiddenFolderLinkIds.add(item.folder_linkId);
			this.selectedItems.delete(item);
		}

		this.selectedItemsSubject.next(this.selectedItems);

		remove(this.currentFolder.ChildItemVOs, (x) =>
			hiddenFolderLinkIds.has(x.folder_linkId),
		);
		this.debug('hideItemsInCurrentFolder %d removed', itemsInFolder.length);
	}

	public async fetchLeanItems(
		items: Array<ItemVO>,
		currentFolder?: FolderVO,
	): Promise<number> {
		this.debug('fetchLeanItems %d items requested', items.length);

		const itemResolves = [];
		const itemRejects = [];
		let handleItemRegistration = false;

		if (currentFolder) {
			handleItemRegistration = true;
			items.forEach((item) => {
				this.registerItem(item);
			});
		} else {
			currentFolder = this.currentFolder;
		}
		const folder = new FolderVO({
			archiveNbr: currentFolder.archiveNbr,
			folder_linkId: currentFolder.folder_linkId,
			ChildItemVOs: items
				.filter((item) => {
					if (item.isFetching) {
						return false;
					}

					item.isFetching = true;
					item.fetched = new Promise((resolve, reject) => {
						itemResolves.push(resolve);
						itemRejects.push(reject);
					});
					return true;
				})
				.map((item) => ({
					folder_linkId: item.folder_linkId,
				})),
		});

		if (!folder.ChildItemVOs.length) {
			this.debug('fetchLeanItems all items already fetching');
			return await Promise.resolve(0);
		}

		return await this.api.folder
			.getLeanItems([folder])
			.pipe(
				map((response: FolderResponse) => {
					if (!response.isSuccessful) {
						throw response;
					}

					const fetchedFolder = response.getFolderVO();

					return fetchedFolder.ChildItemVOs;
				}),
			)
			.toPromise()
			.then(async (leanItems) => {
				leanItems.forEach((leanItem, index) => {
					const item = this.byFolderLinkId[leanItem.folder_linkId];
					if (item) {
						this.byArchiveNbr[leanItem.archiveNbr] = item;
						(item as FolderVO).update(leanItem);

						item.dataStatus = DataStatus.Lean;
						item.isFetching = false;
						itemResolves[index]();
						item.fetched = null;

						if (
							!item.isFolder &&
							!item.thumbURL200 &&
							item.parentFolderId === this.currentFolder.folderId
						) {
							this.debug('thumbRefreshQueue push %s', item.archiveNbr);
							this.thumbRefreshQueue.push(item);
						}
					}
				});

				if (handleItemRegistration) {
					items.forEach((item) => {
						this.unregisterItem(item);
					});
				}

				this.debug('fetchLeanItems %d items fetched', leanItems.length);

				return await Promise.resolve(leanItems.length);
			})
			.catch((response) => {
				itemRejects.forEach((reject, index) => {
					items[index].isFetching = false;
					items[index].fetched = null;
					reject();
				});
				return 0;
			});
	}

	public async fetchFullItems(items: Array<ItemVO>, withChildren?: boolean) {
		this.debug('fetchFullItems %d items requested', items.length);

		const itemResolves = [];
		const itemRejects = [];

		const records: Array<any | RecordVO> = [];
		const folders: Array<any | FolderVO> = [];

		items.forEach((item) => {
			item.isFetching = true;
			item.fetched = new Promise((resolve, reject) => {
				itemResolves.push(resolve);
				itemRejects.push(reject);
			});

			if (item.isRecord) {
				records.push(item);
			} else {
				folders.push(item);
			}
		});

		const promises: Promise<any>[] = [];

		promises.push(
			records.length ? this.api.record.get(records) : Promise.resolve(),
		);

		if (withChildren) {
			promises.push(
				folders.length
					? this.api.folder.getWithChildren(folders)
					: Promise.resolve(),
			);
		} else {
			promises.push(
				folders.length ? this.api.folder.get(folders) : Promise.resolve(),
			);
		}
		return await Promise.all(promises)
			.then(async (results) => {
				const recordResponse: RecordResponse = results[0];
				const folderResponse: FolderResponse = results[1];

				let fullRecords: Array<any | RecordVO>;
				let fullFolders: Array<any | FolderVO>;

				if (recordResponse) {
					fullRecords = recordResponse.getRecordVOs();
				}

				if (folderResponse) {
					fullFolders = folderResponse.getFolderVOs();
				}

				for (let i = 0; i < records.length; i += 1) {
					records[i].update(fullRecords[i]);
					records[i].dataStatus = DataStatus.Full;
					this.tags.checkTagsOnItem(records[i]);
				}

				for (let i = 0; i < folders.length; i += 1) {
					const folder = folders[i] as FolderVO;
					folder.update(
						fullFolders[i] as FolderVOData,
						folders[i] === this.currentFolder,
					);
					folder.dataStatus = DataStatus.Full;
					this.tags.checkTagsOnItem(folders[i]);
				}

				itemResolves.forEach((resolve, index) => {
					items[index].fetched = null;
					this.byArchiveNbr[items[index].archiveNbr] = items[index];
					resolve();
				});

				this.debug('fetchFullItems %d items fetched', items.length);

				return await Promise.resolve(true);
			})
			.catch(() => {
				itemRejects.forEach((reject, index) => {
					items[index].fetched = null;
					reject();
				});
			});
	}

	public async refreshCurrentFolder(sortOnly = false) {
		this.debug('refreshCurrentFolder (sortOnly = %o)', sortOnly);

		return await this.api.folder
			.navigate(this.currentFolder)
			.pipe(
				map((response: FolderResponse) => {
					this.debug('refreshCurrentFolder data fetched', sortOnly);

					if (!response.isSuccessful) {
						throw response;
					}

					return response.getFolderVO(true);
				}),
			)
			.toPromise()
			.then((updatedFolder: FolderVO) => {
				this.updateChildItems(this.currentFolder, updatedFolder, sortOnly);
				this.hideItemsInCurrentFolder();
				this.debug('refreshCurrentFolder done', sortOnly);
				this.folderUpdate.emit(this.currentFolder);
				this.currentHiddenItems = [];
			});
	}

	public updateChildItems(
		folder1: FolderVO,
		folder2: FolderVO,
		sortOnly = false,
	) {
		this.debug('updateChildItems (sortOnly = %o)', sortOnly);

		if (!folder2.ChildItemVOs || !folder2.ChildItemVOs.length) {
			folder1.ChildItemVOs = folder2.ChildItemVOs;
			this.debug('updateChildItems done no child items', sortOnly);
			return;
		}

		const original = folder1.ChildItemVOs as ItemVO[];
		const updated = folder2.ChildItemVOs as ItemVO[];

		const originalItemsById = new Map<number, ItemVO>();
		const updatedItemsById = new Map<number, ItemVO>();

		const updatedOrderedIds: number[] = [];

		if (sortOnly) {
			for (const item of original) {
				originalItemsById.set(item.folder_linkId, item);
			}

			const sortedItems: ItemVO[] = updated.map((item) =>
				originalItemsById.get(item.folder_linkId),
			);

			folder1.ChildItemVOs = sortedItems;
		} else {
			for (const item of updated) {
				updatedItemsById.set(item.folder_linkId, item);
				updatedOrderedIds.push(item.folder_linkId);
			}

			for (const item of original) {
				originalItemsById.set(item.folder_linkId, item);

				if (updatedItemsById.has(item.folder_linkId)) {
					const updatedItem = updatedItemsById.get(item.folder_linkId);
					const dataToUpdate: FolderVOData | RecordVOData = {
						updatedDT: updatedItem.updatedDT,
					};
					item.update(dataToUpdate);
				} else {
					if (this.selectedItems.has(item)) {
						this.selectedItems.delete(item);
						this.selectedItemsSubject.next(this.selectedItems);
					}
				}
			}

			const finalUpdatedItems: ItemVO[] = updatedOrderedIds.map((id) => {
				const isNew = !originalItemsById.has(id);
				const item = isNew
					? updatedItemsById.get(id)
					: originalItemsById.get(id);
				if (isNew) {
					item.isNewlyCreated = true;
				}
				return item;
			});

			folder1.ChildItemVOs = finalUpdatedItems;
		}

		this.debug('updateChildItems done %d items', folder1.ChildItemVOs.length);
	}

	public checkMissingThumbs() {
		if (!this.currentFolder) {
			return;
		}

		if (this.thumbRefreshQueue.length) {
			const itemsToCheck = this.thumbRefreshQueue;
			this.thumbRefreshQueue = [];
			this.debug('checkMissingThumbs %d items', itemsToCheck.length);
			this.fetchLeanItems(itemsToCheck).then(() => {
				this.scheduleMissingThumbsCheck();
			});
		} else {
			return this.scheduleMissingThumbsCheck();
		}
	}

	public scheduleMissingThumbsCheck() {
		this.thumbRefreshTimeout = setTimeout(() => {
			this.checkMissingThumbs();
		}, THUMBNAIL_REFRESH_INTERVAL);
	}

	public getItemByArchiveNbr(archiveNbr: string): RecordVO | FolderVO {
		return this.byArchiveNbr[archiveNbr];
	}

	public getItemByFolderLinkId(folderLinkId: number): RecordVO | FolderVO {
		return this.byFolderLinkId[folderLinkId];
	}

	public getItemsByFolderLinkIds(
		folderLinkIds: (number | string)[],
	): Array<RecordVO | FolderVO> {
		return folderLinkIds.map((id) => this.getItemByFolderLinkId(Number(id)));
	}

	public async downloadFile(item: RecordVO, type?: string): Promise<any> {
		if (item.FileVOs && item.FileVOs.length) {
			downloadFile(item, type);
			return await Promise.resolve();
		} else {
			return await this.fetchFullItems([item]).then(() => {
				downloadFile(item, type);
			});
		}

		function downloadFile(fileItem: any, type?: string) {
			const fileVO = getFile(fileItem, type) as any;
			const link = document.createElement('a');
			link.href = fileVO.downloadURL;
			link.click();
		}

		function getFile(fileItem: RecordVO, type?: string) {
			if (type) {
				return find(fileItem.FileVOs, { type });
			}

			return find(fileItem.FileVOs, { format: 'file.format.original' });
		}
	}

	public async createZipForDownload(items: ItemVO[]): Promise<any> {
		return await this.api.folder.createZip(items);
	}

	public selectedItems$() {
		return this.selectedItemsSubject.asObservable();
	}

	public getSelectedItems() {
		return this.selectedItemsSubject.value;
	}

	public onSelectEvent(selectEvent: SelectEvent) {
		switch (selectEvent.type) {
			case 'click':
				switch (selectEvent.modifierKey) {
					case 'ctrl':
						this.clickItemSingle(selectEvent.item, false);
						break;
					case 'shift':
						this.clickItemsBetweenItems(
							this.lastManualclickItem,
							selectEvent.item,
						);
						break;
					default:
						this.clickItemSingle(selectEvent.item);
				}
				break;
			case 'key':
				switch (selectEvent.key) {
					case 'up':
					case 'down':
						const items = this.currentFolder.ChildItemVOs;
						const index = this.lastManualclickItem
							? findIndex(items, this.lastManualclickItem)
							: 0;
						if (selectEvent.modifierKey) {
							if (!this.lastArrowclickItem) {
								this.lastArrowclickItem = this.lastManualclickItem;
							}
							const indexEnd = this.lastArrowclickItem
								? findIndex(items, this.lastArrowclickItem)
								: 0;
							let newIndex = indexEnd + (selectEvent.key === 'up' ? -1 : 1);
							newIndex = Math.max(0, newIndex);
							newIndex = Math.min(items.length - 1, newIndex);
							const newItem = items[newIndex];
							this.clickItemsBetweenIndicies(index, newIndex);
							this.lastArrowclickItem = newItem;
						} else {
							let newIndex = index + (selectEvent.key === 'up' ? -1 : 1);
							newIndex = Math.max(0, newIndex);
							newIndex = Math.min(items.length - 1, newIndex);
							const newItem = items[newIndex];
							if (newItem !== this.lastManualclickItem) {
								this.clickItemSingle(newItem);
							}
						}
						break;
					case 'a':
						this.clickItemsBetweenIndicies(
							0,
							this.currentFolder.ChildItemVOs.length - 1,
						);
						break;
				}
				break;
		}
	}

	clearSelectedItems() {
		this.selectedItems.clear();
		this.selectedItemsSubject.next(this.selectedItems);
	}

	clickItemSingle(item: ItemVO, replace = true) {
		if (this.selectedItems.has(item)) {
			if (this.selectedItems.size > 1 && replace) {
				this.selectedItems.clear();
				this.selectedItems.add(item);
			} else if (replace) {
				this.selectedItems.clear();
			} else {
				this.selectedItems.delete(item);
			}
		} else {
			if (replace) {
				this.selectedItems.clear();
				this.lastManualclickItem = this.lastArrowclickItem = item;
			}
			this.selectedItems.add(item);
		}

		this.selectedItemsSubject.next(this.selectedItems);
	}

	async fetchSelectedItems() {
		return await this.fetchFullItems(Array.from(this.selectedItems.keys()));
	}

	clickItemsBetweenIndicies(item1Index: number, item2Index: number) {
		const items = this.currentFolder.ChildItemVOs;

		this.selectedItems.clear();

		let current = Math.min(item1Index, item2Index);
		const end = Math.max(item1Index, item2Index);

		while (current <= end) {
			this.selectedItems.add(items[current]);
			current += 1;
		}

		this.selectedItemsSubject.next(this.selectedItems);
	}

	clickItemsBetweenItems(item1: ItemVO, item2: ItemVO) {
		const items = this.currentFolder.ChildItemVOs;
		const item1Index = item1 ? findIndex(items, item1) : 0;
		const item2Index = findIndex(items, item2);

		this.clickItemsBetweenIndicies(item1Index, item2Index);
	}

	public setMultiSelect(enabled: boolean) {
		this.multiSelectEnabled = enabled;
		this.multiSelectChange.emit(enabled);

		if (!this.multiSelectEnabled) {
			setTimeout(() => {
				this.multiclickItems.clear();
			}, 500);
		}
	}

	public setItemMultiSelectStatus(item: ItemVO, selected: boolean) {
		if (selected) {
			this.multiclickItems.set(item.folder_linkId, item);
		} else {
			this.multiclickItems.delete(item.folder_linkId);
		}
	}

	public showItem(item: ItemVO, select = false) {
		this.showItemSubject.next(item);
		if (select) {
			this.clearSelectedItems();
			this.clickItemSingle(this.byFolderLinkId[item.folder_linkId], true);
			this.debug('selected item %o', item);
		}
	}

	public itemToShow$() {
		return this.showItemSubject.asObservable();
	}

	public unsharedItem$() {
		return this.unsharedItemSubject.asObservable();
	}

	public itemUnshared(item: ItemVO) {
		this.clearSelectedItems();
		this.unsharedItemSubject.next(item);
	}

	public showItemAfterNavigate(item: ItemVO) {
		this.debug('got item to show after navigate %o', item);
		this.itemToShowAfterNavigate = item;
	}

	public getItemToShowAfterNavigate() {
		const item = this.itemToShowAfterNavigate;
		this.itemToShowAfterNavigate = null;
		return item;
	}

	public beginPreparingForNavigate() {
		this.eventSubject.next(true);
	}

	public getThumbRefreshQueue(): Array<ItemVO> {
		return this.thumbRefreshQueue;
	}
}
