import { Component } from '@angular/core';
import { UploadService } from '@core/services/upload/upload.service';
import { UploadItem } from '@core/services/upload/uploadItem';
import {
	UploadProgressEvent,
	UploadSessionStatus,
} from '@core/services/upload/upload.session';

@Component({
	selector: 'pr-upload-progress',
	templateUrl: './upload-progress.component.html',
	styleUrls: ['./upload-progress.component.scss'],
	standalone: false,
})
export class UploadProgressComponent {
	UploadSessionStatus = UploadSessionStatus;
	public visible = false;
	public useFade = false;

	public status: UploadSessionStatus;

	public start = true;
	public inProgress = false;
	public done = false;

	public currentItem: UploadItem;
	public fileCount: any;

	public isUploadingFolder = false;
	public folderTargetName = '';

	constructor(private upload: UploadService) {
		this.upload.registerComponent(this);

		this.upload.uploadSession.progress.subscribe(
			(progressEvent: UploadProgressEvent) => {
				this.status = progressEvent.sessionStatus;
				switch (progressEvent.sessionStatus) {
					case UploadSessionStatus.Start:
						this.upload.showProgress();
						break;
					case UploadSessionStatus.Done:
					case UploadSessionStatus.DefaultError:
					case UploadSessionStatus.StorageError:
						this.upload.dismissProgress();
						if (this.isUploadingFolder) {
							this.isUploadingFolder = false;
							this.folderTargetName = '';
						}
						break;
					case UploadSessionStatus.InProgress:
						this.displayFolderUploadDestination(progressEvent);
						break;
				}

				if (progressEvent.item) {
					this.currentItem = progressEvent.item;
				}

				this.fileCount = progressEvent.statistics;
			},
		);
	}

	show() {
		this.visible = true;
	}

	dismiss() {
		this.visible = false;
	}

	getProgressTransform() {
		if (this.currentItem) {
			return `scaleX(${this.currentItem.transferProgress})`;
		} else {
			return 'scaleX(0)';
		}
	}

	displayFolderUploadDestination(progressEvent: UploadProgressEvent) {
		this.isUploadingFolder =
			this.upload.getTargetFolderId() !==
			progressEvent.item?.parentFolder.folderId;
		if (this.isUploadingFolder) {
			this.folderTargetName = `${this.upload.getTargetFolderName()}/${
				progressEvent.item?.parentFolder.displayName
			}`;
		} else if (
			progressEvent.item?.parentFolder.displayName === 'My Files' &&
			progressEvent.item?.parentFolder.pathAsArchiveNbr.length === 1
		) {
			this.folderTargetName = 'Private';
		} else {
			this.folderTargetName = progressEvent.item?.parentFolder.displayName;
		}
	}
}
