import { Component } from '@angular/core';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
} from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { AuthResponse } from '@shared/services/api/auth.repo';

@Component({
	selector: 'pr-forgot-password-embed',
	templateUrl: './forgot-password-embed.component.html',
	styleUrls: ['./forgot-password-embed.component.scss'],
	standalone: false,
})
export class ForgotPasswordEmbedComponent {
	forgotForm: UntypedFormGroup;
	formErrors: any = {};

	waiting: boolean;
	success: boolean;

	constructor(
		fb: UntypedFormBuilder,
		private api: ApiService,
		private message: MessageService,
	) {
		this.forgotForm = fb.group({
			email: ['', [Validators.required, Validators.email]],
		});
	}

	onSubmit(formValue: any) {
		this.waiting = true;

		this.api.auth
			.forgotPassword(formValue.email)
			.subscribe((response: AuthResponse) => {
				this.waiting = false;
				if (response.isSuccessful) {
					this.success = true;
				} else {
					this.message.showError({
						message: response.getMessage(),
						translate: true,
					});
				}
			});
	}
}
