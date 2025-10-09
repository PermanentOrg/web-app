import { Component } from '@angular/core';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
	UntypedFormControl,
} from '@angular/forms';
import { AccountPasswordVOData } from '@models/account-password-vo';
import { AccountVO } from '@models/account-vo';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import {
	PromptField,
	PromptService,
} from '@shared/services/prompt/prompt.service';
import { matchControlValidator } from '@shared/utilities/forms';

@Component({
	selector: 'pr-change-password',
	templateUrl: './change-password.component.html',
	styleUrl: './change-password.component.scss',
	standalone: false,
})
export class ChangePasswordComponent {
	public changePasswordForm: UntypedFormGroup;
	public account: AccountVO;

	public waiting = false;

	constructor(
		private fb: UntypedFormBuilder,
		private message: MessageService,
		private api: ApiService,
		private accountService: AccountService,
		private prompt: PromptService,
	) {
		this.account = this.accountService.getAccount();

		this.changePasswordForm = fb.group({
			password: ['', [Validators.required, Validators.minLength(8)]],
			passwordOld: ['', [Validators.required, Validators.minLength(8)]],
		});

		const verifyPasswordControl = new UntypedFormControl('', [
			Validators.required,
			matchControlValidator(this.changePasswordForm.controls.password),
		]);
		this.changePasswordForm.addControl('passwordVerify', verifyPasswordControl);
	}

	async onChangePasswordFormSubmit(value: AccountPasswordVOData) {
		this.waiting = true;
		let trustToken = null;

		try {
			const loginResp = await this.accountService.checkForMFAWithLogin(
				value.passwordOld,
			);
			if (loginResp.needsMFA()) {
				const mfa = await this.showMFAPrompt();
				try {
					const keepLoggedIn = this.accountService.getAccount().keepLoggedIn;
					const mfaResp = await this.accountService.verifyMfa(
						mfa.verificationCode,
						keepLoggedIn,
					);
					trustToken = mfaResp.getTrustToken().value;
				} catch (err) {
					this.message.showError({
						message: 'Incorrect verification code entered',
					});
					throw err;
				}
			}
			await this.api.auth.updatePassword(this.account, value, trustToken);
			this.message.showMessage({
				message: 'Password updated.',
				style: 'success',
			});
		} catch (err) {
			if (err instanceof AuthResponse) {
				this.message.showError({ message: err.getMessage(), translate: true });
			}
		} finally {
			this.waiting = false;
			this.changePasswordForm.reset();
		}
	}

	public async showMFAPrompt(): Promise<{ verificationCode: string }> {
		const mfaField: PromptField = {
			fieldName: 'verificationCode',
			placeholder: 'Verification Code',
			initialValue: '',
			type: 'text',
		};
		return await this.prompt.prompt(
			[mfaField],
			'A verification code has been sent to your email address or phone number. Please enter it below to change your password.',
		);
	}
}
