import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { PayerService } from '@shared/services/payer/payer.service';
import { SwitcherComponent } from '@shared/components/switcher/switcher.component';
import { AccountVO } from '../../../models/account-vo';
import { ApiService } from '../../../shared/services/api/api.service';
import { MessageService } from '../../../shared/services/message/message.service';
import { ConfirmPayerDialogComponent } from '../confirm-payer-dialog/confirm-payer-dialog.component';

@Component({
	selector: 'pr-archive-payer',
	templateUrl: './archive-payer.component.html',
	styleUrls: ['./archive-payer.component.scss'],
	standalone: false,
})
export class ArchivePayerComponent implements OnInit {
	@Input() public archive: ArchiveVO;
	@Input() public payer: AccountVO;

	roles = {
		'access.role.owner': 'Owner',
		'access.role.manager': 'Manager',
	};

	@ViewChild(SwitcherComponent, { static: false }) payerSet: SwitcherComponent;

	public account: AccountVO;
	public hasPayer: boolean = false;
	public isPayerDifferentThanLoggedUser: boolean = false;
	public hasAccess: boolean;

	constructor(
		private accountService: AccountService,
		private dialog: DialogCdkService,
		private api: ApiService,
		private msg: MessageService,
		private payerService: PayerService,
	) {
		this.account = this.accountService.getAccount();
	}

	ngOnInit(): void {
		const accessRole = this.accountService.getArchive()?.accessRole;
		this.hasAccess =
			accessRole === 'access.role.owner' ||
			accessRole === 'access.role.manager';

		this.hasPayer = !!this.payer;
		if (this.hasPayer) {
			this.payerService.payerId = this.payer.accountId;
		}
		this.isPayerDifferentThanLoggedUser =
			this.account?.accountId !== this.archive?.payerAccountId;
	}

	setArchivePayer(data) {
		this.dialog.open(ConfirmPayerDialogComponent, {
			data,
			width: '550px',
			panelClass: 'dialog',
		});
	}

	async handleAccountInfoChange(val: boolean) {
		this.archive.payerAccountId = val ? null : this.account.accountId;
		try {
			this.api.archive.update(this.archive);
			this.hasPayer = !val;
			this.isPayerDifferentThanLoggedUser = val;
			this.payerService.payerId = this.archive.payerAccountId;
		} catch (e) {
			this.msg.showError({
				message: 'Something went wrong. Please try again.',
			});
		}
	}

	cancelAccountPayerSet() {
		this.payerSet.switch.nativeElement.checked =
			!this.isPayerDifferentThanLoggedUser;
	}
}
