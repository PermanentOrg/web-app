import { Component, OnDestroy } from '@angular/core';
import { remove } from 'lodash';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO, ItemVO, RecordVO } from '@root/app/models/index';
import { GetThumbnail } from '@models/get-thumbnail';
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

	// The folders navigated through to reach the current one, most recent last.
	// Back replays these rather than rebuilding a parent from ids, so setFolder
	// always receives a complete FolderVO.
	private visitedFolders: FolderVO[] = [];

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

		this.visitedFolders = [];
		void this.setFolderAndLoadChildData(startingFolder);

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
		const folderNavigatedFrom = this.currentFolder;
		const didLoadFolder = await this.setFolderAndLoadChildData(folder);

		// Only record where we came from once the new folder actually loaded,
		// otherwise a failed navigation costs an extra Back press to undo.
		if (didLoadFolder && folderNavigatedFrom) {
			this.visitedFolders.push(folderNavigatedFrom);
		}
	}

	showRecord(record: RecordVO) {
		this.selectedRecord = record;
	}

	getThumbnailUrl(item: ItemVO): string | undefined {
		return GetThumbnail(item);
	}

	// Resolves to whether the folder loaded, so callers can leave the navigation
	// history alone when it did not.
	async setFolder(folder: FolderVO): Promise<boolean> {
		this.waiting = true;
		try {
			// The root keeps loading through getRoot -- see isRootRootFolder.
			const folderResponse = this.isRootRootFolder(folder)
				? await this.api.folder.getRoot()
				: await this.api.folder.getWithChildren([
						new FolderVO({
							folder_linkId: folder.folder_linkId,
							folderId: folder.folderId,
							archiveNbr: folder.archiveNbr,
						}),
					]);
			this.currentFolder = folderResponse.getFolderVO(true);

			// Copy and Move send only the destination's folder_linkId to the
			// legacy endpoints, and Stela's folder response does not reliably
			// carry it. We asked for this folder by id, so keep the ids we had
			// rather than trusting the response to echo them back.
			this.currentFolder.folder_linkId ??= folder.folder_linkId;
			this.currentFolder.archiveNbr ??= folder.archiveNbr;

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
			return true;
		} catch (err) {
			if (err instanceof FolderResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			} else {
				// getWithChildren rejects with the raw HTTP error rather than a
				// FolderResponse, so there is no server message to surface. Fall
				// back to the generic one instead of rethrowing into an unhandled
				// rejection.
				this.message.showError({
					message: 'error.generic.internal',
					translate: true,
				});
			}
			return false;
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
		// Replay the folder we came from, so this behaves exactly like navigating
		// forward: a complete FolderVO goes to setFolder, and the child data is
		// loaded afterwards so thumbnails come back too. Peek rather than pop, so
		// a failed load leaves the history where it was and Back still works.
		const previousFolder = this.visitedFolders[this.visitedFolders.length - 1];

		// Nothing to go back to when the picker was opened directly on a workspace
		// folder, as the record choosers do with My Files. Going up from there
		// means the archive root.
		const didLoadFolder = await this.setFolderAndLoadChildData(
			previousFolder ?? new FolderVO({ type: 'type.folder.root.root' }),
		);

		if (didLoadFolder && previousFolder) {
			this.visitedFolders.pop();
		}
	}

	async loadCurrentFolderChildData() {
		return await this.dataService.fetchLeanItems(
			this.currentFolder.ChildItemVOs,
			this.currentFolder,
		);
	}

	private async setFolderAndLoadChildData(folder: FolderVO): Promise<boolean> {
		const didLoadFolder = await this.setFolder(folder);

		// setFolder no longer rethrows, so without this guard a failed load would
		// read child items off a currentFolder that is still unset (or, worse,
		// still the folder we were leaving).
		if (didLoadFolder) {
			void this.loadCurrentFolderChildData();
		}

		return didLoadFolder;
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
			this.visitedFolders = [];
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

	// Stela serves the archive root as an ordinary folder -- it lists Apps and
	// reports a type that does not read as root -- so the root keeps loading
	// through the legacy getRoot endpoint.
	private isRootRootFolder(folder: FolderVO): boolean {
		return !!folder.type?.includes('type.folder.root.root');
	}
}
