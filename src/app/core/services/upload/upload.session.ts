import { Injectable, EventEmitter } from '@angular/core';
import { BaseResponse } from '@shared/services/api/base';
import { FolderVO } from '@root/app/models';
import debug from 'debug';
import { AccountService } from '../../../shared/services/account/account.service';
import { Uploader } from './uploader';
import { UploadItem, UploadStatus } from './uploadItem';

export enum UploadSessionStatus {
	Start,
	InProgress,
	Done,
	DefaultError,
	StorageError,
	CreatingFolders,
	FileNoBytesError,
	NoAccessToUpload,
}

export interface UploadProgressEvent {
	item?: UploadItem;
	sessionStatus: UploadSessionStatus;
	statistics: {
		current: number;
		completed: number;
		total: number;
		error: number;
	};
}

const isOutOfStorageMessage = (response: BaseResponse) =>
	response.messageIncludesPhrase('no_space_left');

@Injectable()
export class UploadSession {
	public progress: EventEmitter<UploadProgressEvent> = new EventEmitter();

	private queue: UploadItem[] = [];
	private statistics = {
		current: 0,
		completed: 0,
		total: 0,
		error: 0,
	};
	private sentStart: boolean = false;
	private inProgress: boolean = false;

	private debug = debug('service:uploadSession');

	constructor(
		private uploader: Uploader,
		private account: AccountService,
	) {}

	private emitProgress = (item: UploadItem) =>
		this.progress.emit({
			item,
			sessionStatus: UploadSessionStatus.InProgress,
			statistics: this.statistics,
		});

	private emitError = (error: UploadSessionStatus, item: UploadItem) =>
		this.progress.emit({
			item,
			sessionStatus: error,
			statistics: this.statistics,
		});

	public startSession() {
		if (!this.sentStart) {
			this.progress.emit({
				sessionStatus: UploadSessionStatus.Start,
				statistics: this.statistics,
			});
			this.sentStart = true;
		}
	}

	public startFolders() {
		this.progress.emit({
			sessionStatus: UploadSessionStatus.CreatingFolders,
			statistics: this.statistics,
		});
	}

	public queueFiles(parentFolder: FolderVO, files: File[]) {
		this.debug(
			'UploadSession.queueFiles: %d files to folder %o',
			files.length,
			parentFolder,
		);
		this.startSession();

		files
			.map((file) => new UploadItem(file, parentFolder))
			.forEach((item) => this.queue.push(item));
		this.statistics.total += files.length;
		this.debug('Queue: %o', this.queue);

		if (!this.inProgress) {
			this.debug('No previous upload in progress; starting upload');
			this.inProgress = true;
			setTimeout(this.uploadNextInQueue, 0);
		}
	}

	private uploadNextInQueue = async () => {
		const item = this.queue.shift();
		if (!item) {
			this.endSession();
			return;
		}

		this.debug('Starting upload for item %o', item);

		const progressHandler = (transferProgress: number) => {
			item.transferProgress = transferProgress;
			this.emitProgress(item);
		};

		try {
			this.statistics.current += 1;

			await this.uploader.uploadFile(item, progressHandler);
			this.account.deductAccountStorage(item.file.size);

			this.statistics.completed += 1;
			item.uploadStatus = UploadStatus.Done;
			this.emitProgress(item);
		} catch (err: unknown) {
			item.uploadStatus = UploadStatus.Cancelled;
			this.statistics.error += 1;

			const accessRole = this.account.getArchive().accessRole;

			if (err instanceof BaseResponse && accessRole === 'access.role.viewer') {
				this.emitError(UploadSessionStatus.NoAccessToUpload, item);
			} else if (err instanceof BaseResponse && item.file.size === 0) {
				this.emitError(UploadSessionStatus.FileNoBytesError, item);
			} else if (err instanceof BaseResponse && isOutOfStorageMessage(err)) {
				this.emitError(UploadSessionStatus.StorageError, item);
			} else {
				this.emitError(UploadSessionStatus.DefaultError, item);
			}
		}
		setTimeout(this.uploadNextInQueue, 0);
	};

	private endSession = () => {
		this.debug('End of upload session');
		this.progress.emit({
			sessionStatus: UploadSessionStatus.Done,
			statistics: this.statistics,
		});

		this.sentStart = false;
		this.inProgress = false;
		this.statistics = {
			current: 0,
			completed: 0,
			total: 0,
			error: 0,
		};
	};
}
