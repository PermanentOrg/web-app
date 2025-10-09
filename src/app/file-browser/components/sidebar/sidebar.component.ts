import { RecordVO } from '@root/app/models';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DataService } from '@shared/services/data/data.service';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { some } from 'lodash';
import { ItemVO, FolderVO, ArchiveVO, AccessRole } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { EditService } from '@core/services/edit/edit.service';
import { AccountService } from '@shared/services/account/account.service';

import type { KeysOfType } from '@shared/utilities/keysoftype';

type SidebarTab = 'info' | 'details' | 'sharing' | 'views';
@Component({
	selector: 'pr-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
	standalone: false,
})
export class SidebarComponent implements OnDestroy, HasSubscriptions {
	currentTab: SidebarTab = 'info';
	selectedItem: ItemVO = this.dataService.currentFolder;
	selectedItems: ItemVO[];

	subscriptions: Subscription[] = [];

	isLoading = false;
	isRootFolder = false;
	isPublicItem = false;
	isRecord = false;

	currentArchive: ArchiveVO;

	canEdit: boolean;
	canShare: boolean;
	canUseViews: boolean;

	originalFileExtension: string = '';
	permanentFileExtension: string = '';

	constructor(
		private dataService: DataService,
		private editService: EditService,
		private accountService: AccountService,
		private cdr: ChangeDetectorRef,
	) {
		this.currentArchive = this.accountService.getArchive();

		this.subscriptions.push(
			this.dataService.selectedItems$().subscribe(async (selectedItems) => {
				if (!selectedItems.size) {
					this.selectedItem = this.dataService.currentFolder;
					this.selectedItems = null;
				} else if (selectedItems.size === 1) {
					this.selectedItem = Array.from(selectedItems.keys())[0];
					this.selectedItems = null;
				} else {
					this.selectedItem = null;
					this.selectedItems = Array.from(selectedItems.keys());
				}

				this.isRootFolder = this.selectedItem?.type?.includes('root');
				this.isPublicItem =
					this.selectedItem?.type?.includes('public') ||
					this.selectedItem?.folder_linkType?.includes('public');

				this.checkPermissions();

				this.canUseViews =
					!this.isRootFolder &&
					this.isPublicItem &&
					this.selectedItem &&
					this.selectedItem.isFolder;

				if (this.isRootFolder) {
					this.setCurrentTab('info');
				}

				if (!this.canUseViews && this.currentTab === 'views') {
					this.setCurrentTab('info');
				}

				if (this.selectedItem !== this.dataService.currentFolder) {
					const items = this.selectedItems || [this.selectedItem];
					this.isLoading = some(items, (i) => i.dataStatus < DataStatus.Full);
					if (this.isLoading) {
						await this.dataService.fetchFullItems(items);
						this.isLoading = false;
					}
				}
				if (
					this.selectedItem instanceof RecordVO &&
					this.selectedItem.FileVOs &&
					this.selectedItem.FileVOs[0]
				) {
					this.originalFileExtension = this.selectedItem.FileVOs.find(
						(item) => item.format === 'file.format.original',
					)
						?.type.split('.')
						.pop();

					this.permanentFileExtension =
						this.selectedItem.FileVOs.find(
							(item) => item.format === 'file.format.converted',
						)
							?.type.split('.')
							.pop() || this.originalFileExtension;
				} else {
					this.originalFileExtension = '';
					this.permanentFileExtension = '';
					this.isRecord = !this.selectedItem.isFolder;
				}
			}),
		);
	}

	ngOnDestroy() {
		unsubscribeAll(this.subscriptions);
	}

	checkPermissions() {
		const items = this.selectedItems || [this.selectedItem];
		const viewOnly = some(
			items,
			(i) =>
				i.accessRole === 'access.role.viewer' ||
				i.accessRole === 'access.role.contributor',
		);

		this.canEdit =
			!viewOnly &&
			this.accountService.checkMinimumArchiveAccess(AccessRole.Editor);

		if (items.length === 1) {
			this.canShare =
				!this.isPublicItem &&
				!this.isRootFolder &&
				this.accountService.checkMinimumAccess(
					this.selectedItem.accessRole,
					AccessRole.Owner,
				);
		} else {
			this.canShare = false;
		}
	}

	setCurrentTab(tab: SidebarTab) {
		if (tab === 'sharing' && (this.isRootFolder || this.isPublicItem)) {
			return;
		}

		if (tab === 'views' && !this.canUseViews) {
			return;
		}

		this.currentTab = tab;
	}

	async onFinishEditing(property: KeysOfType<ItemVO, String>, value: string) {
		this.editService.saveItemVoProperty(this.selectedItem, property, value);
		this.cdr.detectChanges();
	}

	onLocationClick() {
		if (this.canEdit) {
			this.editService.openLocationDialog(this.selectedItem);
		}
	}

	onLocationEnterPress(e: KeyboardEvent): void {
		if (this.canEdit && e.key === 'Enter') {
			this.editService.openLocationDialog(this.selectedItem);
		}
	}

	onShareClick() {
		this.editService.openShareDialog(this.selectedItem);
	}

	getFolderContentsCount() {
		if (
			this.selectedItem instanceof FolderVO &&
			this.selectedItem.FolderSizeVO
		) {
			const fileCount = this.selectedItem.FolderSizeVO.allRecordCountShallow;
			const folderCount = this.selectedItem.FolderSizeVO.allFolderCountShallow;
			const fileLabel = fileCount > 1 ? 'files' : 'file';
			const folderLabel = folderCount > 1 ? 'folders' : 'folder';

			if (fileCount && folderCount) {
				return `${folderCount} ${folderLabel} and ${fileCount} ${fileLabel}`;
			} else if (fileCount) {
				return `${fileCount} ${fileLabel}`;
			} else if (folderCount) {
				return `${folderCount} ${folderLabel}`;
			} else {
				return 'Empty';
			}
		}
	}
}
