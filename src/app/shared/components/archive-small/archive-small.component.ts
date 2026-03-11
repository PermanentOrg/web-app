import {
	Component,
	OnInit,
	OnChanges,
	Input,
	SimpleChanges,
	HostBinding,
	Output,
	EventEmitter,
	ElementRef,
} from '@angular/core';
import { ArchiveVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { ApiService } from '@shared/services/api/api.service';
import { GetThumbnail } from '@models/get-thumbnail';

@Component({
	selector: 'pr-archive-small',
	templateUrl: './archive-small.component.html',
	styleUrls: ['./archive-small.component.scss'],
	standalone: false,
})
export class ArchiveSmallComponent implements OnInit, OnChanges {
	@Input() archive: ArchiveVO = null;
	@HostBinding('class.clickable') @Input() clickable = false;
	@Input() relation: string;
	@Input() accessRole: string;
	@Input() isPending = false;

	@Output() archiveClick = new EventEmitter<any>();

	@HostBinding('class.large-on-desktop') @Input() largeOnDesktop = false;
	@Input() showRemove = false;
	@Input() removeText = 'Remove';
	@Input() removeIcon = 'delete';
	@Output() removeClick = new EventEmitter<any>();

	@Input() showEdit = false;
	@Output() editClick = new EventEmitter<any>();

	@Input() showAccept = false;
	@Input() showAcceptMobile = false;
	@Input() acceptText = 'Accept';
	@Input() acceptIcon = 'check';
	@Output() acceptClick = new EventEmitter<any>();

	@Input() showDefault = true;

	@Input() actionsAsDropdown = false;

	public isCurrent = false;
	public relationDisplay: string;
	public accessRoleDisplay: string;

	constructor(
		private account: AccountService,
		private api: ApiService,
		private prConstants: PrConstantsService,
		public element: ElementRef,
	) {}

	ngOnInit() {
		const currentArchive = this.account.getArchive();
		if (currentArchive) {
			this.isCurrent =
				this.account.getArchive().archiveId === this.archive.archiveId;
		} else {
			this.isCurrent = false;
		}

		if (!this.isPending) {
			this.isPending = this.archive && this.archive.isPending();
		}

		this.checkArchiveThumbnail();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.relation) {
			if (this.relation) {
				this.relationDisplay = this.prConstants.translate(this.relation);
			} else {
				this.relationDisplay = null;
			}
		}

		if (changes.accessRole) {
			if (this.accessRole) {
				this.accessRoleDisplay = this.prConstants.translate(this.accessRole);
			} else {
				this.accessRoleDisplay = null;
			}
		}
	}

	checkArchiveThumbnail() {
		if (
			!GetThumbnail(this.archive) &&
			this.archive.status === 'status.archive.gen_avatar'
		) {
			setTimeout(async () => {
				const response = await this.api.archive.get([this.archive]);
				const updated = response.getArchiveVO();
				this.archive.update(updated);
				this.checkArchiveThumbnail();
			}, 5000);
		}
	}

	isDefaultArchive() {
		return (
			this.account.getAccount()?.defaultArchiveId === this.archive.archiveId
		);
	}
}
