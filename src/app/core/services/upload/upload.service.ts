import { Injectable, EventEmitter, OnDestroy } from '@angular/core';

import { remove } from 'lodash';

import { UploadProgressComponent } from '@core/components/upload-progress/upload-progress.component';

import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';

import { FolderVO } from '@root/app/models';

import { UploadButtonComponent } from '@core/components/upload-button/upload-button.component';
import { Subscription } from 'rxjs';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import debug from 'debug';
import { AccountService } from '@shared/services/account/account.service';
import { UploadStatus } from './uploadItem';
import { UploadSession, UploadSessionStatus } from './upload.session';

const FILENAME_BLACKLIST = ['.DS_Store'];

interface FileWithPath {
	file: File;
	path?: string;
	parentFolder?: FolderVO;
}

interface FileSystemFolder {
	path?: string;
	parentFolder?: FolderVO;
	folder?: FolderVO;
}

@Injectable()
export class UploadService implements HasSubscriptions, OnDestroy {
	public component: UploadProgressComponent;
	public buttonComponents: UploadButtonComponent[] = [];
	public progressVisible: EventEmitter<boolean> = new EventEmitter();

	subscriptions: Subscription[] = [];

	protected uploadStart: Date;

	private debug = debug('service:upload');
	private targetFolderName = '';
	private targetFolderId: number;

	constructor(
		private api: ApiService,
		private message: MessageService,
		private dataService: DataService,
		private accountService: AccountService,
		public uploadSession: UploadSession,
	) {
		this.subscriptions.push(
			this.uploadSession.progress.subscribe((progressEvent) => {
				if (progressEvent.item?.uploadStatus === UploadStatus.Done) {
					const parentFolderId = progressEvent.item.parentFolder.folderId;
					if (
						dataService.currentFolder &&
						dataService.currentFolder.folderId === parentFolderId
					) {
						this.dataService.refreshCurrentFolder();
					}

					this.accountService.refreshAccountDebounced();
				}

				switch (progressEvent.sessionStatus) {
					case UploadSessionStatus.Start:
						this.message.showMessage({
							message:
								"Please don't close your browser until the upload is complete.",
						});
						this.uploadStart = new Date();
						break;
					case UploadSessionStatus.Done:
						this.accountService.refreshAccountDebounced();
						this.reportUploadTime();
						break;
					case UploadSessionStatus.DefaultError:
						this.message.showError({
							message:
								'Oops, something went wrong! Please try again. If the issue persists, reach out to us at support@permanent.org.',
						});
						this.accountService.refreshAccountDebounced();
						break;
					case UploadSessionStatus.FileNoBytesError:
						this.message.showError({
							message:
								'This file cannot be uploaded because it is empty. Please check that the file is working and try again.',
						});
						this.accountService.refreshAccountDebounced();
						break;

					case UploadSessionStatus.NoAccessToUpload:
						this.message.showError({
							message: 'You do not have permission to upload to this archive.',
							externalUrl:
								'https://permanent.zohodesk.com/portal/en/kb/articles/roles-for-collaboration-and-sharing',
							externalMessage: 'Read More',
						});
						break;
					case UploadSessionStatus.StorageError:
						this.message.showError({
							message:
								'You do not have enough storage available to upload these files.',
						});
						this.accountService.refreshAccountDebounced();
						break;
				}
			}),
		);
	}

	ngOnDestroy() {
		unsubscribeAll(this.subscriptions);
	}

	registerButtonComponent(component: UploadButtonComponent) {
		this.buttonComponents.push(component);
	}

	unregisterButtonComponent(component: UploadButtonComponent) {
		remove(this.buttonComponents, component);
	}

	registerComponent(component: UploadProgressComponent) {
		this.component = component;
	}

	promptForFiles() {
		if (this.buttonComponents.length) {
			this.buttonComponents[0].promptForFiles();
		}
	}

	uploadFiles(parentFolder: FolderVO, files: File[]) {
		this.debug('uploadFiles %d files to folder %o', files.length, parentFolder);

		return this.uploadSession.queueFiles(parentFolder, files);
	}

	async uploadFolders(parentFolder: FolderVO, entries: FileSystemEntry[]) {
		this.debug(
			'uploadFolders %d items to folder %o',
			entries.length,
			parentFolder,
		);

		this.uploadSession.startSession();

		const self = this;
		const foldersByPath: Map<string, FileSystemFolder> = new Map();
		const filesByPath: Map<string, FileWithPath[]> = new Map();

		foldersByPath.set('', { path: '', folder: parentFolder });

		await getItemsFromItemList(entries);
		this.createFoldersAndUploadFiles(foldersByPath, filesByPath);

		async function getItemsFromItemList(dirEntries: any[]) {
			self.debug(
				'uploadFolders getItemsFromItemList %d items in folder',
				entries.length,
			);
			const filePromises: Promise<any>[] = [];
			for (const entry of dirEntries) {
				if (entry.isFile) {
					const { promise, resolve } = Promise.withResolvers();
					filePromises.push(promise);
					entry.file((file) => {
						if (FILENAME_BLACKLIST.includes((file as File).name)) {
							return resolve(undefined);
						}

						// store file with parent folder VO grouped by path
						const path = entry.fullPath;
						const pathParts = path.split('/');
						pathParts.pop();
						const parentPath = pathParts.join('/');
						const fileWithPath = {
							path: parentPath,
							file,
							parentFolder: foldersByPath.get(parentPath).folder,
						};

						if (filesByPath.has(parentPath)) {
							filesByPath.get(parentPath).push(fileWithPath);
						} else {
							filesByPath.set(parentPath, [fileWithPath]);
						}

						resolve(undefined);
					});
				} else {
					const vo = new FolderVO({ displayName: entry.name });
					const path = entry.fullPath;
					const pathParts = path.split('/');
					pathParts.pop();
					const parentPath = pathParts.join('/');
					const folder: FileSystemFolder = {
						path,
						folder: vo,
						parentFolder: foldersByPath.get(parentPath).folder,
					};
					foldersByPath.set(entry.fullPath, folder);
					const childEntries = await readDirectory(entry);
					await getItemsFromItemList(childEntries);
				}
			}

			await Promise.all(filePromises);
		}

		async function readDirectory(directory): Promise<any[]> {
			const dirReader = directory.createReader();
			let e = [];

			const { promise, resolve } = Promise.withResolvers<any[]>();
			const getEntries = function () {
				dirReader.readEntries(function (results) {
					if (results.length) {
						e = e.concat(Array.from(results));
						getEntries();
					} else {
						resolve(e);
					}
				});
			};

			getEntries();

			return await promise;
		}
	}

	async createFoldersAndUploadFiles(
		folders: Map<string, FileSystemFolder>,
		files: Map<string, FileWithPath[]>,
	) {
		const pathsByDepth = new Map<number, FileSystemFolder[]>();
		for (const [path, folder] of folders) {
			const depth = path.split('/').length - 1;
			if (pathsByDepth.has(depth)) {
				pathsByDepth.get(depth).push(folder);
			} else {
				pathsByDepth.set(depth, [folder]);
			}
		}

		const parentFolder = pathsByDepth.get(0)[0].folder;

		this.setTargetFolderNameAndId(parentFolder);

		this.uploadSession.startFolders();

		// group folder creation at each depth
		for (const [depth, foldersAtDepth] of pathsByDepth) {
			// create folders if needed
			const needIds = foldersAtDepth.filter((f) => !f.folder.folderId);

			let needsRefresh = false;
			if (needIds.length && depth > 0) {
				for (const f of needIds) {
					f.folder.parentFolderId = f.parentFolder.folderId;
					f.folder.parentFolder_linkId = f.parentFolder.folder_linkId;

					if (
						f.parentFolder.folderId === this.dataService.currentFolder.folderId
					) {
						needsRefresh = true;
					}
				}

				const maxFoldersPerBatch = 10;
				const folderBatches = needIds.reduce<Array<FileSystemFolder[]>>(
					(array, folder, index) => {
						const batchIndex = Math.floor(index / maxFoldersPerBatch);

						if (array[batchIndex]) {
							array[batchIndex].push(folder);
						} else {
							array[batchIndex] = [folder];
						}

						return array;
					},
					[],
				);

				for (const batch of folderBatches) {
					const response = await this.api.folder.post(
						batch.map((f) => f.folder),
					);
					const updatedFolders = response.getFolderVOs();

					batch.forEach((f, i) => {
						f.folder.update(updatedFolders[i]);
					});
				}
			}

			if (needsRefresh) {
				this.dataService.refreshCurrentFolder();
			}
		}

		for (const [, foldersAtDepth] of pathsByDepth) {
			// queue uploads for each folder
			for (const f of foldersAtDepth) {
				if (files.has(f.path)) {
					const filesForFolder = files.get(f.path);
					this.uploadFiles(
						f.folder,
						filesForFolder.map((i) => i.file),
					);
				}
			}
		}
	}

	private setTargetFolderName(folder: FolderVO): void {
		if (
			folder.displayName === 'My Files' &&
			folder.pathAsArchiveNbr.length === 1
		) {
			this.targetFolderName = 'Private';
		} else {
			this.targetFolderName = folder.displayName;
		}
	}

	private setTargetFolderId(folderId: number): void {
		this.targetFolderId = folderId;
	}

	private setTargetFolderNameAndId(folder: FolderVO) {
		this.setTargetFolderName(folder);
		this.setTargetFolderId(folder.folderId);
	}

	public getTargetFolderName(): string {
		return this.targetFolderName;
	}

	public getTargetFolderId(): number {
		return this.targetFolderId;
	}

	showProgress() {
		if (this.component) {
			this.component.show();
		}
		this.progressVisible.emit(true);
	}

	dismissProgress() {
		if (this.component) {
			this.component.dismiss();
		}
		this.progressVisible.emit(false);
	}

	protected reportUploadTime(): void {
		const elapsedSeconds =
			(new Date().getTime() - this.uploadStart.getTime()) / 1000;
		// eslint-disable-next-line no-console
		console.log(`Total Upload Time: ${elapsedSeconds}s`);
	}
}
