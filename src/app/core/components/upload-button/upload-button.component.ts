import {
	Component,
	OnDestroy,
	ViewChild,
	ElementRef,
	Input,
	HostBinding,
} from '@angular/core';
import { UploadService } from '@core/services/upload/upload.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderVO } from '@root/app/models';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { checkMinimumAccess, AccessRole } from '@models/access-role';
import { AccountService } from '@shared/services/account/account.service';
import {
	HasSubscriptions,
	unsubscribeAll,
} from '@shared/utilities/hasSubscriptions';
import { Subscription } from 'rxjs';
import { EventService } from '@shared/services/event/event.service';

@Component({
	selector: 'pr-upload-button',
	templateUrl: './upload-button.component.html',
	styleUrls: ['./upload-button.component.scss'],
	standalone: false,
})
export class UploadButtonComponent implements OnDestroy, HasSubscriptions {
	private files: File[];
	@Input() fullWidth: boolean;

	@ViewChild('fileInput', { static: true }) fileInput: ElementRef;
	public currentFolder: FolderVO;
	@HostBinding('hidden') hidden: boolean;
	public disabled: boolean;

	isDragTarget: boolean;
	isDropTarget: boolean;

	subscriptions: Subscription[] = [];

	constructor(
		private upload: UploadService,
		private account: AccountService,
		private dataService: DataService,
		private prompt: PromptService,
		private ga: GoogleAnalyticsService,
		private event: EventService,
	) {
		this.subscriptions.push(
			this.dataService.currentFolderChange.subscribe((currentFolder) => {
				this.currentFolder = currentFolder;
				this.checkCurrentFolder();
			}),
		);

		this.upload.registerButtonComponent(this);
	}

	ngOnDestroy() {
		this.upload.unregisterButtonComponent(this);
		unsubscribeAll(this.subscriptions);
	}

	promptForFiles() {
		this.fileInput.nativeElement.click();
	}

	checkCurrentFolder() {
		if (this.currentFolder) {
			this.hidden =
				this.currentFolder.type === 'type.folder.root.share' ||
				this.currentFolder.type === 'type.folder.root.app' ||
				this.currentFolder.type === 'page';
			this.disabled =
				!checkMinimumAccess(
					this.currentFolder.accessRole,
					AccessRole.Contributor,
				) ||
				!checkMinimumAccess(
					this.account.getArchive().accessRole,
					AccessRole.Contributor,
				) ||
				(this.currentFolder.type.includes('app') &&
					this.currentFolder.special !== 'familysearch.root.folder');
		} else {
			this.hidden = true;
		}
	}

	async onFileChange(event) {
		this.files = Array.from(event.target.files);
		if (this.currentFolder) {
			if (this.currentFolder.type.includes('public')) {
				try {
					await this.prompt.confirm(
						'Upload to public',
						'This is a public folder. Are you sure you want to upload here?',
					);
					this.ga.sendEvent(EVENTS.PUBLISH.PublishByUrl.uploaded.params);
					this.upload.uploadFiles(this.currentFolder, this.files);
				} catch (err) {}
			} else {
				this.upload.uploadFiles(this.currentFolder, this.files);
			}
		}
		event.target.value = '';
	}

	filePickerClick(): boolean {
		this.event.dispatch({
			entity: 'account',
			action: 'initiate_upload',
		});
		return true;
	}
}
