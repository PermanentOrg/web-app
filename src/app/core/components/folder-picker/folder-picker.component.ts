import { Component, OnDestroy } from '@angular/core';
import { remove } from 'lodash';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, ItemVO, RecordVO } from '@root/app/models/index';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { MessageService } from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';

export enum FolderPickerOperations {
	Move = 1,
	Copy,
	ChooseRecord,
}

@Component({
	selector: 'pr-folder-picker',
	templateUrl: './folder-picker.component.html',
	styleUrls: ['./folder-picker.component.scss'],
	standalone: false,
})
export class FolderPickerComponent implements OnDestroy {
	public currentFolder: FolderVO;
	public chooseFolderPromise: Promise<FolderVO | RecordVO>;
	public chooseFolderResolve: (value: FolderVO | RecordVO) => void;
	public operation: FolderPickerOperations;
	public operationName: string;

	public savePromise: Promise<any>;
	public visible: boolean;
	public waiting: boolean;
	public saving: boolean;
	public isRootFolder = true;
	public allowRecords = false;

	public selectedRecord: ItemVO;

	public filterFolderLinkIds: number[];

	private cancelResetTimeout: ReturnType<typeof setTimeout>;

	constructor(
		private dataService: DataService,
		private api: ApiService,
		private message: MessageService,
		private folderPickerService: FolderPickerService,
		private prompt: PromptService,
	) {
		this.folderPickerService.registerComponent(this);
	}

	async show(
		startingFolder: FolderVO,
		operation: FolderPickerOperations,
		savePromise?: Promise<any>,
		filterFolderLinkIds: number[] = null,
		allowRecords = false,
	) {
		if (this.cancelResetTimeout) {
			clearTimeout(this.cancelResetTimeout);
			this.cancelResetTimeout = null;
		}
		this.visible = true;
		this.operation = operation;
		this.allowRecords = allowRecords;

		this.savePromise = savePromise;

		this.filterFolderLinkIds = filterFolderLinkIds;

		switch (operation) {
			case FolderPickerOperations.Move:
				this.operationName = 'Move';
				break;
			case FolderPickerOperations.Copy:
				this.operationName = 'Copy';
				break;
			case FolderPickerOperations.ChooseRecord:
				this.operationName = 'Choose file';
				break;
		}

		this.setFolder(startingFolder).then(() => {
			this.loadCurrentFolderChildData();
		});

		const { promise, resolve } = Promise.withResolvers<FolderVO | RecordVO>();
		this.chooseFolderPromise = promise;
		this.chooseFolderResolve = resolve;

		return await this.chooseFolderPromise;
	}

	onItemClick(item: ItemVO, evt: Event) {
		if (item instanceof FolderVO) {
			this.navigate(item);
		} else {
			this.showRecord(item);
		}

		evt.stopPropagation();
		evt.preventDefault();
		return false;
	}

	async navigate(folder: FolderVO) {
		await this.setFolder(folder);
		this.loadCurrentFolderChildData();
	}

	showRecord(record: RecordVO) {
		this.selectedRecord = record;
	}

	async setFolder(folder: FolderVO) {
		this.waiting = true;
		try {
			const folderResponse = await this.api.folder
				.navigate(
					new FolderVO({
						folder_linkId: folder.folder_linkId,
						folderId: folder.folderId,
						archiveNbr: folder.archiveNbr,
					}),
				)
				.toPromise();
			this.currentFolder = folderResponse.getFolderVO(true);
			this.isRootFolder = this.currentFolder.type.includes(
				'type.folder.root.root',
			);
			if (!this.allowRecords) {
				remove(this.currentFolder.ChildItemVOs, 'isRecord');
			}
			if (this.filterFolderLinkIds && this.filterFolderLinkIds.length) {
				remove(this.currentFolder.ChildItemVOs, (f: ItemVO) =>
					this.filterFolderLinkIds.includes(f.folder_linkId),
				);
			}
			remove(this.currentFolder.ChildItemVOs, (item) =>
				item.type.includes('type.folder.root.app'),
			);
			remove(this.currentFolder.ChildItemVOs, (item) =>
				item.type.includes('type.folder.root.vault'),
			);
		} catch (err) {
			if (err instanceof FolderResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			} else {
				throw err;
			}
		} finally {
			this.waiting = false;
		}
	}

	onBackClick() {
		if (this.selectedRecord) {
			this.selectedRecord = null;
		} else {
			this.goToParentFolder();
		}
	}

	async goToParentFolder() {
		const parentFolder = new FolderVO({
			folder_linkId: this.currentFolder.parentFolder_linkId,
			folderId: this.currentFolder.parentFolderId,
		});
		return await this.setFolder(parentFolder);
	}

	async loadCurrentFolderChildData() {
		return await this.dataService.fetchLeanItems(
			this.currentFolder.ChildItemVOs,
			this.currentFolder,
		);
	}

	chooseFolder() {
		if (this.shouldConfirmFolderSelection()) {
			this.prompt
				.confirm(
					'Yes',
					`This folder is publicly accessible by others. Are you sure you would like to ${this.operationName.toLocaleLowerCase()} to this location?`,
				)
				.then(() => {
					this.setChosenFolder();
				})
				.catch(() => {
					// Just exit out of confirm box
				});
		} else {
			this.setChosenFolder();
		}
	}

	hide() {
		this.visible = false;
		this.selectedRecord = null;

		this.cancelResetTimeout = setTimeout(() => {
			this.currentFolder = null;
			this.chooseFolderPromise = null;
			this.chooseFolderResolve = null;
			this.isRootFolder = true;
			this.cancelResetTimeout = null;
		}, 500);
	}

	ngOnDestroy() {
		this.folderPickerService.unregisterComponent();
	}

	public cannotCopyToFolder(): boolean {
		return this.isRootFolder || this.currentFolder?.type.includes('root.app');
	}

	protected setChosenFolder(): void {
		if (this.selectedRecord) {
			this.chooseFolderResolve(this.selectedRecord);
		} else if (this.currentFolder) {
			this.chooseFolderResolve(this.currentFolder);
		}
		if (this.savePromise) {
			this.saving = true;
			this.savePromise
				.then(() => {
					this.saving = false;
					this.hide();
				})
				.catch(() => {
					this.saving = false;
					this.hide();
				});
		} else {
			this.hide();
		}
	}

	protected shouldConfirmFolderSelection(): boolean {
		return this.currentFolder.type.endsWith('public');
	}
}
