import { Injectable } from '@angular/core';
import { partition } from 'lodash';
import { Subject } from 'rxjs';
import debug from 'debug';

import { ApiService } from '@shared/services/api/api.service';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import {
	FolderVO,
	RecordVO,
	ItemVO,
	FolderVOData,
	RecordVOData,
	ShareVO,
} from '@root/app/models';

import { ShareLink } from '@root/app/share-links/models/share-link';

import {
	FolderResponse,
	RecordResponse,
	ShareResponse,
} from '@shared/services/api/index.repo';
import {
	PromptButton,
	PromptService,
} from '@shared/services/prompt/prompt.service';
import { Deferred } from '@root/vendor/deferred';
import { FolderPickerOperations } from '@core/components/folder-picker/folder-picker.component';
import { AccountService } from '@shared/services/account/account.service';
import { DeviceService } from '@shared/services/device/device.service';
import { SecretsService } from '@shared/services/secrets/secrets.service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';

import type { KeysOfType } from '@shared/utilities/keysoftype';
import { EventService } from '@shared/services/event/event.service';
import { SharingComponent } from '@fileBrowser/components/sharing/sharing.component';
import { PublishComponent } from '@fileBrowser/components/publish/publish.component';
import { EditTagsComponent } from '@fileBrowser/components/edit-tags/edit-tags.component';
import { LocationPickerComponent } from '@fileBrowser/components/location-picker/location-picker.component';
import { SharingDialogComponent } from '@fileBrowser/components/sharing-dialog/sharing-dialog.component';
import { FolderPickerService } from '../folder-picker/folder-picker.service';

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
		buttonName: 'delete',
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

export type ActionType =
	| 'delete'
	| 'rename'
	| 'share'
	| 'publish'
	| 'download'
	| 'copy'
	| 'move'
	| 'setFolderView'
	| 'tags';

type EditServiceClipboardOperation = 'copy' | 'move';

interface EditServiceClipboard {
	items: ItemVO[];
	operation: EditServiceClipboardOperation;
}

@Injectable({
	providedIn: 'root',
})
export class EditService {
	private clipboard: EditServiceClipboard;

	private deleteSubject = new Subject<void>();
	public deleteNotifier$ = this.deleteSubject.asObservable();

	private isGoogleMapsApiLoaded = false;
	private googleMapsLoadedDeferred: Deferred;

	private debug = debug('service:editService');

	constructor(
		private api: ApiService,
		private shareApi: ShareLinksApiService,
		private message: MessageService,
		private folderPicker: FolderPickerService,
		private dataService: DataService,
		private prompt: PromptService,
		private accountService: AccountService,
		private dialog: DialogCdkService,
		private device: DeviceService,
		private secrets: SecretsService,
		private event: EventService,
	) {
		this.loadGoogleMapsApi();
	}

	loadGoogleMapsApi() {
		if (window.doNotLoadGoogleMapsAPI) {
			this.debug('Google Maps API disabled in testing environment');
			return;
		}

		if (window.google?.maps) {
			this.debug('Google Maps API already loaded, skipping');
			this.isGoogleMapsApiLoaded = true;
			return;
		}

		if (!this.isGoogleMapsApiLoaded) {
			this.googleMapsLoadedDeferred = new Deferred();

			const script = document.createElement('script');
			const callbackName = '__gmapsLoaded';
			const apiKey = this.secrets.get('GOOGLE_API_KEY');
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=places`;
			script.defer = true;
			script.async = true;

			window[callbackName] = () => {
				this.isGoogleMapsApiLoaded = true;
				this.googleMapsLoadedDeferred.resolve();
				this.debug('Google Maps API loaded');
			};

			document.head.appendChild(script);
		}
	}

	async waitForGoogleMapsApi() {
		if (this.isGoogleMapsApiLoaded) {
			return await Promise.resolve();
		} else {
			return await this.googleMapsLoadedDeferred.promise;
		}
	}

	sendToClipboard(items: ItemVO[], operation: EditServiceClipboardOperation) {
		this.clipboard = {
			items,
			operation,
		};
	}

	promptForAction(items: ItemVO[], actions: PromptButton[] = []) {
		const actionDeferred = new Deferred();

		let title;

		if (items.length > 1) {
			title = `${items.length} items selected`;
		} else {
			title = items[0].displayName;
		}

		if (actions.length) {
			this.prompt
				.promptButtons(actions, title, actionDeferred.promise)
				.then((value: ActionType) => {
					this.handleAction(items, value, actionDeferred);
				})
				.catch();
		} else {
			try {
				this.prompt.confirm(
					'OK',
					title,
					null,
					null,
					`<p>No actions available</p>`,
				);
			} catch (err) {}
		}
	}

	async handleAction(
		items: ItemVO[],
		value: ActionType,
		actionDeferred: Deferred,
	) {
		try {
			switch (value) {
				case 'delete':
					await this.deleteItems(items);
					this.dataService.refreshCurrentFolder();
					actionDeferred.resolve();
					break;
				case 'move':
					actionDeferred.resolve();
					this.openFolderPicker(items, FolderPickerOperations.Move);
					break;
				case 'copy':
					actionDeferred.resolve();
					this.openFolderPicker(items, FolderPickerOperations.Copy);
					break;
				case 'download':
					actionDeferred.resolve();
					if (items.length === 1) {
						const item = items[0];
						if (item instanceof RecordVO) {
							this.dataService.downloadFile(item);
						}
					}
					break;
				case 'publish':
					actionDeferred.resolve();
					this.openPublishDialog(items[0]);
					break;
				case 'share': {
					const response: ShareResponse = await this.api.share.getShareLink(
						items[0],
					);
					let newShareLink: ShareLink;
					if (response.getShareByUrlVO()) {
					const shareResponse = await this.shareApi.getShareLinksById([response.getShareByUrlVO().shareby_urlId]);
					newShareLink = shareResponse[0];
					}

					actionDeferred.resolve();
					this.dialog.open(SharingComponent, {
						data: {
							item: items[0],
							link: response.getShareByUrlVO(),
							newShare: newShareLink
						},
					});
					break;
				}
				default:
					actionDeferred.resolve();
			}
		} catch (err) {
			if (err instanceof FolderResponse || err instanceof RecordResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
			actionDeferred.resolve();
		}
	}

	async createFolder(
		folderName: string,
		parentFolder: FolderVO,
	): Promise<FolderVO | FolderResponse> {
		const newFolder = new FolderVO({
			parentFolderId: parentFolder.folderId,
			parentFolder_linkId: parentFolder.folder_linkId,
			displayName: folderName,
		});

		return await this.api.folder
			.post([newFolder])
			.then((response: FolderResponse) => response.getFolderVO());
	}

	async deleteItems(
		items: any[],
	): Promise<FolderResponse | RecordResponse | any> {
		items.forEach((i) => (i.isPendingAction = true));

		const [folders, records] = partition(items, 'isFolder') as [
			FolderVO[],
			RecordVO[],
		];

		const promises: Array<Promise<any>> = [];

		if (folders.length) {
			promises.push(this.api.folder.delete(folders));
		} else {
			promises.push(Promise.resolve());
		}

		if (records.length) {
			promises.push(this.api.record.delete(records));
		} else {
			promises.push(Promise.resolve());
		}

		try {
			await Promise.all(promises);
			this.dataService.hideItemsInCurrentFolder(items);
			this.deleteSubject.next();
		} catch (err) {
			items.forEach((i) => (i.isPendingAction = false));
			throw err;
		} finally {
			this.accountService.refreshAccountDebounced();
		}
	}

	async unshareItem(item: ItemVO) {
		const shareVO = new ShareVO({
			folder_linkId: item.folder_linkId,
			archiveId: this.accountService.getArchive().archiveId,
		});

		await this.api.share.remove(shareVO);
		this.dataService.itemUnshared(item);
	}

	public async saveItemVoProperty(
		item: ItemVO,
		property: KeysOfType<ItemVO, string>,
		value: string,
	) {
		if (item) {
			const originalValue = item[property];
			const newData: Partial<ItemVO> = {};
			newData[property] = value;
			try {
				item.update(newData);
				await this.updateItems([item], [property]);
			} catch (err) {
				if (err instanceof FolderResponse || err instanceof RecordResponse) {
					const revertData: Partial<ItemVO> = {};
					revertData[property] = originalValue;
					item.update(revertData);
				}
			}
		}
	}

	async updateItems(
		items: any[],
		whitelist?: (keyof ItemVO)[],
	): Promise<FolderResponse | RecordResponse | any> {
		const folders: FolderVO[] = [];
		const records: RecordVO[] = [];

		const itemsByLinkId: { [key: number]: ItemVO } = {};

		const recordsByRecordId: Map<number, RecordVO> = new Map();
		const foldersByFolderId: Map<number, FolderVO> = new Map();

		items.forEach((item) => {
			item.isFolder ? folders.push(item) : records.push(item);
			itemsByLinkId[item.folder_linkId] = item;
			if (item instanceof RecordVO) {
				if (item.recordId) {
					recordsByRecordId.set(item.recordId, item);
				}
			} else if (item.folderId) {
				foldersByFolderId.set(item.folderId, item);
			}
		});

		const promises: Array<Promise<any>> = [];

		if (folders.length) {
			promises.push(this.api.folder.update(folders, whitelist));
		} else {
			promises.push(Promise.resolve());
		}

		if (records.length) {
			const archiveId = this.accountService.getArchive().archiveId;
			promises.push(this.api.record.update(records, archiveId));
		} else {
			promises.push(Promise.resolve());
		}

		return await Promise.all(promises).then((results) => {
			const [folderResponse, recordResponse] = results as [
				FolderResponse,
				RecordVO[],
			];
			if (folderResponse) {
				folderResponse.getFolderVOs().forEach((updatedItem) => {
					const newData: FolderVOData = {
						updatedDT: updatedItem.updatedDT,
					};

					if (updatedItem.TimezoneVO) {
						newData.TimezoneVO = updatedItem.TimezoneVO;
					}

					const folder =
						(itemsByLinkId[updatedItem.folder_linkId] as FolderVO) ||
						foldersByFolderId.get(updatedItem.folderId);
					folder.update(newData);
				});
			}

			if (recordResponse) {
				const res = recordResponse[0];

				const newData: RecordVOData = {
					updatedDT: res.updatedDT,
				};

				if (res.TimezoneVO) {
					newData.TimezoneVO = res.TimezoneVO;
				}

				const record =
					itemsByLinkId[res.folder_linkId] ||
					recordsByRecordId.get(res.recordId);

				record.update(newData);
			}
		});
	}

	async moveItems(
		items: ItemVO[],
		destination: FolderVO,
	): Promise<FolderResponse | RecordResponse | any> {
		const folders: FolderVO[] = [];
		const records: RecordVO[] = [];

		const itemsByLinkId: { [key: number]: ItemVO } = {};

		items.forEach((item) => {
			item instanceof FolderVO ? folders.push(item) : records.push(item);
			itemsByLinkId[item.folder_linkId] = item;
			item.isPendingAction = true;
		});

		const promises: Array<Promise<any>> = [];

		if (folders.length) {
			promises.push(this.api.folder.move(folders, destination));
		} else {
			promises.push(Promise.resolve());
		}

		if (records.length) {
			promises.push(this.api.record.move(records, destination));
		} else {
			promises.push(Promise.resolve());
		}

		return await Promise.all(promises)
			.then((results) => {
				this.dataService.hideItemsInCurrentFolder(items);
				this.event.dispatch({
					entity: 'record',
					action: 'move',
				});
				return results;
			})
			.catch((err) => {
				items.forEach((item) => (item.isPendingAction = false));
				throw err;
			});
	}

	async copyItems(
		items: any[],
		destination: FolderVO,
	): Promise<FolderResponse | RecordResponse | any> {
		const folders: FolderVO[] = [];
		const records: RecordVO[] = [];

		const itemsByLinkId: { [key: number]: ItemVO } = {};

		items.forEach((item) => {
			item.isFolder ? folders.push(item) : records.push(item);
			itemsByLinkId[item.folder_linkId] = item;
		});

		const promises: Array<Promise<any>> = [];

		if (folders.length) {
			promises.push(this.api.folder.copy(folders, destination));
		} else {
			promises.push(Promise.resolve());
		}

		if (records.length) {
			promises.push(this.api.record.copy(records, destination));
		} else {
			promises.push(Promise.resolve());
		}

		Promise.all(promises).then(() => {
			this.event.dispatch({
				entity: 'record',
				action: 'copy',
			});
			this.accountService.refreshAccountDebounced();
		});

		return await Promise.all(promises);
	}

	async openShareDialog(item: ItemVO) {
		const response = await this.api.share.getShareLink(item);
		let newShareLink: ShareLink;
		if (response.getShareByUrlVO()) {
			const shareResponse = await this.shareApi.getShareLinksById([response.getShareByUrlVO().shareby_urlId]);
			newShareLink = shareResponse[0];
		}
		if (this.device.isMobile()) {
			try {
				this.dialog.open(SharingComponent, {
					panelClass: 'dialog',
					data: { item, link: response.getShareByUrlVO(), newShare: newShareLink},
				});
			} catch (err) {}
		} else {
			try {
				this.dialog.open(SharingDialogComponent, {
					data: { item, link: response.getShareByUrlVO(), newShare: newShareLink},
					width: '600px',
					panelClass: 'dialog',
				});
			} catch (err) {}
		}
	}

	async openPublishDialog(item: ItemVO) {
		this.dialog.open(PublishComponent, {
			data: { item },
			height: 'auto',
			panelClass: 'dialog',
			width: '400px',
		});
	}

	async openTagsDialog(item: ItemVO, type: string) {
		this.dialog.open(EditTagsComponent, {
			data: { item, type },
			height: 'auto',
			panelClass: 'dialog',
		});
	}

	async openLocationDialog(item: ItemVO) {
		this.dialog.open(LocationPickerComponent, {
			data: { item },
			panelClass: 'dialog',
			height: 'auto',
			width: '600px',
		});
	}

	public async openFolderPicker(
		items: ItemVO[],
		operation: FolderPickerOperations,
	): Promise<void> {
		const deferred = new Deferred();
		const rootFolder = this.accountService.getRootFolder();

		const filterFolderLinkIds = [];

		for (const item of items) {
			if (item.isFolder) {
				filterFolderLinkIds.push(item.folder_linkId);
			}
		}

		return await new Promise<void>((resolve, reject) => {
			this.folderPicker
				.chooseFolder(
					rootFolder,
					operation,
					deferred.promise,
					filterFolderLinkIds,
				)
				.then(async (destination: FolderVO) => {
					switch (operation) {
						case FolderPickerOperations.Copy:
							return await this.copyItems(items, destination);
						case FolderPickerOperations.Move:
							return await this.moveItems(items, destination);
					}
				})
				.then(() => {
					setTimeout(() => {
						deferred.resolve();
						const msg = `${items.length} item(s) ${
							operation === FolderPickerOperations.Copy ? 'copied' : 'moved'
						} successfully.`;
						this.message.showMessage({ message: msg, style: 'success' });
						resolve();
					}, 500);
				})
				.catch((response: FolderResponse | RecordResponse) => {
					deferred.reject();
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				});
		});
	}
}
