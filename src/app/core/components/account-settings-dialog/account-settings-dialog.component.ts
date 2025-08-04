import { Component, Inject } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { AccountResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { ActivatedRoute } from '@angular/router';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

const settingsTabs = [
	'storage',
	'email-phone',
	'notification',
	'personal-details',
	'legacy-contact',
	'delete',
	'advanced-settings',
	'security',
] as const;

export type SettingsTab = (typeof settingsTabs)[number];
@Component({
	selector: 'pr-account-settings-dialog',
	templateUrl: './account-settings-dialog.component.html',
	styleUrls: ['./account-settings-dialog.component.scss'],
	standalone: false,
})
export class AccountSettingsDialogComponent {
	public activeTab: SettingsTab = 'email-phone';

	public readonly verifyText = 'DELETE';
	public deleteVerify: string = null;
	public waiting = false;

	constructor(
		@Inject(DIALOG_DATA) public data: any,
		private dialogRef: DialogRef,
		public accountService: AccountService,
		private message: MessageService,
		private api: ApiService,
		public route: ActivatedRoute,
	) {
		if (data.tab) {
			this.activeTab = data.tab;
		}
		if (([...settingsTabs] as string[]).includes(route.snapshot.fragment)) {
			this.activeTab = route.snapshot.fragment as SettingsTab;
		}
	}

	onDoneClick() {
		this.dialogRef.close();
	}

	setTab(tab: SettingsTab) {
		this.activeTab = tab;
	}

	async onDeleteAccountConfirm() {
		if (this.deleteVerify !== this.verifyText) {
			return;
		}

		this.waiting = true;

		try {
			await this.api.account.delete(this.accountService.getAccount());
			await this.accountService.logOut();
			window.location.assign('/');
		} catch (err) {
			if (err instanceof AccountResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			} else {
				this.message.showError({
					message: 'There was an error deleting the account.',
					translate: false,
				});
			}
		} finally {
			this.waiting = false;
		}
	}
}
