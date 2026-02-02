import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { FolderVO, ArchiveVO } from '@models';
import {
	ProfileItemVOData,
	ProfileItemVODictionary,
	FieldNameUIShort,
} from '@models/profile-item-vo';
import { AccountService } from '@shared/services/account/account.service';
import { AccessRole } from '@models/access-role';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { ApiService } from '@shared/services/api/api.service';
import {
	ArchiveResponse,
	FolderResponse,
} from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import {
	ProfileService,
	ProfileItemsDataCol,
} from '@shared/services/profile/profile.service';
import {
	collapseAnimation,
	ngIfScaleAnimationDynamic,
} from '@shared/animations';
import debug from 'debug';
import {
	PromptService,
	READ_ONLY_FIELD,
} from '@shared/services/prompt/prompt.service';
import { CookieService } from 'ngx-cookie-service';
import { copyFromInputElement } from '@shared/utilities/forms';
import { EventService } from '@shared/services/event/event.service';
import { LocationPickerComponent } from '@fileBrowser/components/location-picker/location-picker.component';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
	PROFILE_ONBOARDING_COOKIE,
	ProfileEditFirstTimeDialogComponent,
} from '../profile-edit-first-time-dialog/profile-edit-first-time-dialog.component';

@Component({
	selector: 'pr-profile-edit',
	templateUrl: './profile-edit.component.html',
	styleUrls: ['./profile-edit.component.scss'],
	animations: [collapseAnimation, ngIfScaleAnimationDynamic],
	standalone: false,
})
export class ProfileEditComponent implements OnInit, AfterViewInit {
	archive: ArchiveVO;
	publicRoot: FolderVO;
	profileItems: ProfileItemVODictionary;

	canEdit: boolean;
	loading = true;

	isPublic = true;

	fieldPlacholders = {
		address: 'Choose a location',
		phone: '555-555-5555',
	};

	totalProgress = 0;
	countUpOptions = {
		useEasing: true,
		useGrouping: false,
		separator: ',',
		decimal: '.',
		duration: 1,
		suffix: '%',
		startValue: 0,
	};

	private debug = debug('component:profileEdit');

	constructor(
		private account: AccountService,
		private dialogRef: DialogRef,
		@Inject(DIALOG_DATA) public data: any,
		private dialog: DialogCdkService,
		private api: ApiService,
		private folderPicker: FolderPickerService,
		private profile: ProfileService,
		private prompt: PromptService,
		private message: MessageService,
		private cookies: CookieService,
		private event: EventService,
	) {}

	async ngOnInit(): Promise<void> {
		this.event.dispatch({
			entity: 'account',
			action: 'open_archive_profile',
		});
		this.archive = this.account.getArchive();
		this.publicRoot = new FolderVO(this.account.getPublicRoot());
		await this.profile.fetchProfileItems();
		this.loading = false;
		this.profileItems = this.profile.getProfileItemDictionary();
		this.canEdit = this.account.checkMinimumArchiveAccess(AccessRole.Curator);
		this.checkProfilePublic();
		this.updateProgress();
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.showFirstTimeDialog();
		});
	}

	showFirstTimeDialog() {
		if (this.cookies.check(PROFILE_ONBOARDING_COOKIE)) {
			return;
		}

		if (this.totalProgress >= 0.1) {
			return;
		}

		try {
			this.dialog.open(ProfileEditFirstTimeDialogComponent, {
				width: '760px',
				height: 'auto',
			});
		} catch (err) {}
	}

	onDoneClick() {
		this.dialogRef.close();
	}

	updateProgress() {
		this.totalProgress = this.profile.calculateProfileProgress();
	}

	getProgressTransform() {
		return `transform: translateX(${this.totalProgress * 100 - 100}%)`;
	}

	checkProfilePublic() {
		this.isPublic = this.profile.checkProfilePublic();
	}

	async onProfilePictureClick() {
		this.profile.promptForProfilePicture();
	}

	async chooseBannerPicture() {
		const originalValue = this.publicRoot.thumbArchiveNbr;
		try {
			const record = (await this.folderPicker.chooseRecord(
				this.account.getPrivateRoot(),
			)) as any;
			const updateFolder = new FolderVO(this.publicRoot);
			updateFolder.thumbArchiveNbr = record.archiveNumber;
			await this.api.folder.updateRoot(
				[updateFolder],
				['thumbArchiveNbr', 'view', 'viewProperty'],
			);
			// borrow thumb URLs from record for now, until they can be regenerated
			this.publicRoot.thumbArchiveNbr = record.archiveNumber;
			this.publicRoot.thumbURL200 = record.thumbURL200;
			this.publicRoot.thumbURL500 = record.thumbURL500;
			this.publicRoot.thumbURL1000 = record.thumbURL1000;
			this.publicRoot.thumbURL2000 = record.thumbURL2000;
		} catch (err) {
			if (err instanceof FolderResponse) {
				this.publicRoot.thumbArchiveNbr = originalValue;
			}
		}
	}

	async onSaveProfileItem(
		item: ProfileItemVOData,
		valueKey: ProfileItemsDataCol,
		newValue: any,
		refreshArchive = false,
	) {
		const originalValue = item[valueKey];
		item[valueKey] = newValue as never;
		item.isPendingAction = true;
		try {
			if (this.profile.isItemEmpty(item)) {
				this.debug('item is empty, attempting delete %o', item);
				if (item.profile_itemId) {
					await this.profile.deleteProfileItem(item);
				}
			} else {
				await this.profile.saveProfileItem(item, [valueKey]);
				this.trackProfileEdit(item);
			}
			if (refreshArchive) {
				await this.account.refreshArchive();
			}
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				item[valueKey] = originalValue as never;
				this.message.showError({ message: err.getMessage(), translate: true });
			}
		} finally {
			item.isPendingAction = false;
			this.updateProgress();
		}
	}

	async onRemoveProfileItemClick(item: ProfileItemVOData) {
		const { promise, resolve } = Promise.withResolvers();
		try {
			if (!this.profile.isItemEmpty(item)) {
				await this.prompt.confirm(
					'Remove',
					'Remove this item?',
					promise,
					'btn-danger',
				);
			}
			await this.profile.deleteProfileItem(item);
			this.trackProfileEdit(item);
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
		} finally {
			resolve(undefined);
			this.updateProgress();
		}
	}

	async onProfilePublicChange(isPublic: boolean) {
		try {
			await this.profile.setProfilePublic(isPublic);
		} catch (err) {
			if (err instanceof ArchiveResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
			this.isPublic = !isPublic;
		}
	}

	addEmptyProfileItem(fieldNameShort: FieldNameUIShort) {
		const empty = this.profile.createEmptyProfileItem(fieldNameShort);
		empty.isNewlyCreated = true;
		this.profile.addProfileItemToDictionary(empty);
	}

	async chooseLocationForItem(item: ProfileItemVOData) {
		try {
			this.dialog.open(LocationPickerComponent, {
				data: { profileItem: item },
				height: 'auto',
				width: '600px',
			});
		} finally {
			this.updateProgress();
			this.trackProfileEdit(item);
		}
	}

	async onShareClick() {
		const url = `https://${location.host}/p/archive/${this.archive.archiveNbr}/profile`;
		const fields = [READ_ONLY_FIELD('profileLink', 'Profile link', url)];

		const { promise, resolve } = Promise.withResolvers();

		await this.prompt.prompt(
			fields,
			'Share profile link',
			promise,
			'Copy link',
		);
		const input = this.prompt.getInput('profileLink');
		copyFromInputElement(input);
		resolve(undefined);
	}

	private trackProfileEdit(item: ProfileItemVOData) {
		this.event.dispatch({
			action: 'update',
			entity: 'profile_item',
			profileItem: item,
		});
	}
}
