import { Component, input, output, signal } from '@angular/core';
import {
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { APP_CONFIG } from '@root/app/app.config';
import { ComponentsModule } from '@root/app/component-library/components.module';
import { matchControlValidator, trimWhitespace } from '@shared/utilities/forms';
import { UnlistedShareSignupDetails } from '../../models/unlisted-share-signup-details';

@Component({
	selector: 'pr-unlisted-share-signup-footer',
	standalone: true,
	imports: [ReactiveFormsModule, ComponentsModule],
	templateUrl: './unlisted-share-signup-footer.component.html',
	styleUrls: ['./unlisted-share-signup-footer.component.scss'],
})
export class UnlistedShareSignupFooterComponent {
	isSubmitting = input(false);

	closed = output<void>();
	signupSubmitted = output<UnlistedShareSignupDetails>();

	agreedToTerms = signal(false);
	receivesUpdatesViaEmail = signal(false);

	private readonly passwordControl = new FormControl('', {
		nonNullable: true,
		validators: [
			Validators.required,
			Validators.minLength(APP_CONFIG.passwordMinLength),
		],
	});

	accountDetailsForm = new FormGroup({
		email: new FormControl('', {
			nonNullable: true,
			validators: [trimWhitespace, Validators.required, Validators.email],
		}),
		password: this.passwordControl,
		confirmPassword: new FormControl('', {
			nonNullable: true,
			validators: [
				Validators.required,
				matchControlValidator(this.passwordControl),
			],
		}),
	});

	public canSubmit(): boolean {
		return (
			this.accountDetailsForm.valid &&
			this.agreedToTerms() &&
			!this.isSubmitting()
		);
	}

	public submit(): void {
		if (!this.canSubmit()) {
			return;
		}
		const { email, password } = this.accountDetailsForm.getRawValue();
		this.signupSubmitted.emit({
			email,
			password,
			agreedToTerms: this.agreedToTerms(),
			receivesUpdatesViaEmail: this.receivesUpdatesViaEmail(),
		});
	}

	public close(): void {
		this.closed.emit();
	}
}
