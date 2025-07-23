/* @format */
import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { ApiService } from '@shared/services/api/api.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
	selector: 'pr-welcome-dialog',
	templateUrl: './welcome-dialog.component.html',
	styleUrls: ['./welcome-dialog.component.scss'],
	standalone: false,
})
export class WelcomeDialogComponent implements OnInit {
	public archiveName: string;
	public accessRole: string;
	public isEarlyBird: boolean;

	constructor(
		private dialogRef: DialogRef,
		private account: AccountService,
		private constants: PrConstantsService,
		private api: ApiService,
	) {}

	async ngOnInit(): Promise<void> {
		try {
			const res = await this.api.auth.getInviteToken();
			this.isEarlyBird = res.token === 'earlyb1rd';
		} catch (error) {
			this.isEarlyBird = false;
		}

		const archive = this.account.getArchive();
		this.archiveName = archive.fullName;
		this.accessRole = this.constants.translate(archive.accessRole);
	}

	public close(): void {
		this.dialogRef.close();
	}
}
