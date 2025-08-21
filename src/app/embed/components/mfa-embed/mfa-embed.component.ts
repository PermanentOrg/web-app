import { Component } from '@angular/core';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
} from '@angular/forms';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import {
	AuthResponse,
	ArchiveResponse,
	AccountResponse,
} from '@shared/services/api/index.repo';
import { IFrameService } from '@shared/services/iframe/iframe.service';

@Component({
	selector: 'pr-mfa',
	templateUrl: './mfa-embed.component.html',
	styleUrls: ['./mfa-embed.component.scss'],
	standalone: false,
})
export class MfaEmbedComponent {
	verifyForm: UntypedFormGroup;
	waiting: boolean;

	constructor(
		fb: UntypedFormBuilder,
		private accountService: AccountService,
		private message: MessageService,
		private iFrame: IFrameService,
	) {
		this.verifyForm = fb.group({
			token: ['', Validators.required],
		});
	}

	onSubmit(formValue: any) {
		this.waiting = true;

		this.accountService
			.verifyMfa(formValue.token)
			.then(() => this.accountService.switchToDefaultArchive())
			.then((_: ArchiveResponse) => {
				this.waiting = false;
				this.iFrame.setParentUrl('/app');
			})
			.catch((response: AuthResponse | AccountResponse) => {
				this.waiting = false;
				this.message.showError({
					message: response.getMessage(),
					translate: true,
				});
			});
	}
}
