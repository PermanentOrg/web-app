import { Component, Input, OnInit } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveType } from '@models/archive-vo';
import { Observable } from 'rxjs';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveTypeChangeDialogComponent } from '../archive-type-change-dialog/archive-type-change-dialog.component';

@Component({
	selector: 'pr-public-settings',
	templateUrl: './public-settings.component.html',
	styleUrls: ['./public-settings.component.scss'],
	standalone: false,
})
export class PublicSettingsComponent implements OnInit {
	@Input() public archive: ArchiveVO;
	public updating: boolean = false;
	public allowDownloadsToggle: number = 0;
	public supportLink: string =
		'https://permanent.zohodesk.com/portal/en/newticket';

	//Observable to listen to the archive close
	public archiveClose: Observable<void> = new Observable(() => {
		this.archiveType = this.archive.type;
	});

	public archiveTypes: { value: string; name: string }[] = [
		{ value: 'type.archive.group', name: 'Group' },
		{
			value: 'type.archive.organization',
			name: 'Organization',
		},
		{
			value: 'type.archive.person',
			name: 'Person',
		},
	];

	public archiveType: ArchiveType = 'type.archive.organization';

	constructor(
		private api: ApiService,
		private dialog: DialogCdkService,
		private msg: MessageService,
	) {}

	ngOnInit(): void {
		this.allowDownloadsToggle = +this.archive.allowPublicDownload;
		this.archiveType =
			this.archive.type === 'type.archive.family'
				? 'type.archive.group'
				: this.archive.type;
	}

	public async onAllowDownloadsChange() {
		this.archive.allowPublicDownload = !!this.allowDownloadsToggle;
		this.updating = true;
		try {
			await this.api.archive.update(this.archive);
		} catch {
			// fail silently
		} finally {
			this.updating = false;
		}
	}

	public async onArchiveTypeChange() {
		this.dialog
			.open(ArchiveTypeChangeDialogComponent, {
				data: {
					archive: this.archive,
					archiveType: this.archiveType,
					archiveClose: this.archiveClose,
				},
				width: '700px',
			})
			.closed.subscribe(async (type: ArchiveType) => {
				this.archive.type = type;
				this.updating = true;
				try {
					await this.api.archive.update(this.archive);
				} catch {
					this.msg.showError({
						message:
							'There was an error changing the archive type. Please try again.',
					});
				} finally {
					this.updating = false;
				}
			});
	}
}
