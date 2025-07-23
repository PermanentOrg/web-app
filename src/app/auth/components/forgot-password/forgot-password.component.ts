/* @format */
import { Component, HostBinding } from '@angular/core';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
} from '@angular/forms';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';

@Component({
	selector: 'pr-login',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss'],
	standalone: false,
})
export class ForgotPasswordComponent {
	@HostBinding('class.pr-auth-form') classBinding = true;
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

		this.api.auth.forgotPassword(formValue.email).subscribe(() => {
			this.waiting = false;
			this.success = true;
		});
	}
}
