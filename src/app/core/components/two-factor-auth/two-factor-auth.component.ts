import { Component, OnInit } from '@angular/core';
import {
	UntypedFormBuilder,
	UntypedFormControl,
	UntypedFormGroup,
	Validators,
} from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

interface Method {
	methodId: string;
	method: string;
	value: string;
}
@Component({
	selector: 'pr-two-factor-auth',
	templateUrl: './two-factor-auth.component.html',
	styleUrl: './two-factor-auth.component.scss',
	standalone: false,
})
export class TwoFactorAuthComponent implements OnInit {
	turnOn: boolean = false;
	method: string = '';
	form: UntypedFormGroup;
	methods: Method[] = [];
	selectedMethodToDelete: Method;
	codeSent = false;
	loading = false;

	methodsDictionary = {
		sms: 'SMS Text',
		email: 'Email',
	};

	constructor(
		private fb: UntypedFormBuilder,
		private api: ApiService,
		private message: MessageService,
	) {
		this.form = fb.group({
			code: ['', Validators.required],
			contactInfo: ['', Validators.required],
		});

		this.form.get('contactInfo').valueChanges.subscribe((value) => {
			if (this.method === 'sms') {
				this.formatPhoneNumber(value);
			}
		});
	}

	async ngOnInit() {
		this.loading = true;
		this.methods = await this.api.idpuser.getTwoFactorMethods();

		this.loading = false;
	}

	formatPhoneNumber(value: string) {
		let numbers = value.replace(/\D/g, '');
		let countryCode = '';

		if (numbers.startsWith('00')) {
			const match = numbers.match(/^00(\d{1,3})/);
			if (match) {
				countryCode = `+${match[1]}`;
				numbers = numbers.substring(match[0].length);
			}
		} else if (numbers.startsWith('1') && value.startsWith('+')) {
			countryCode = '+1';
			numbers = numbers.substring(1);
		} else if (value.startsWith('+')) {
			const match = numbers.match(/^(\d{1,3})/);
			if (match) {
				countryCode = `+${match[1]}`;
				numbers = numbers.substring(match[1].length);
			}
		}

		const char = { 0: '(', 3: ') ', 6: '-' };
		let formatted = countryCode ? `${countryCode} ` : '';
		for (let i = 0; i < numbers.length; i += 1) {
			formatted += (char[i] || '') + numbers[i];
		}

		// Update the form control without emitting events
		this.form.get('contactInfo').setValue(formatted, { emitEvent: false });
	}

	async removeMethod(method: Method) {
		try {
			this.selectedMethodToDelete = method;
			this.method = this.selectedMethodToDelete.method;
			this.updateContactInfoValidators();
			this.form.patchValue({ contactInfo: this.selectedMethodToDelete.value });

			this.form.patchValue({ code: '' });
		} catch (error) {}
	}

	submitData(value) {
		if (this.selectedMethodToDelete) {
			this.submitRemoveMethod();
		} else {
			this.submitCreateMethod(value);
		}
		this.form.patchValue({ code: '', contactInfo: '' });
	}

	async sendCode(e) {
		try {
			if (this.selectedMethodToDelete) {
				await this.api.idpuser.sendDisableCode(
					this.selectedMethodToDelete.methodId,
				);
			} else {
				await this.api.idpuser.sendEnableCode(
					this.method,
					this.form.get('contactInfo').value,
				);
			}
		} catch (error) {
		} finally {
			this.codeSent = true;
		}
	}

	cancel() {
		this.selectedMethodToDelete = null;
		this.method = '';
		this.form.patchValue({ contactInfo: '', code: '' });
		this.turnOn = false;
	}

	updateContactInfoValidators() {
		const contactInfoControl = this.form.get('contactInfo');
		contactInfoControl.clearValidators();

		if (this.method === 'email') {
			contactInfoControl.setValidators([Validators.required, Validators.email]);
		} else if (this.method === 'sms') {
			contactInfoControl.setValidators([
				Validators.required,
				this.smsLengthValidator(),
			]);
		}
		contactInfoControl.updateValueAndValidity();
	}

	private smsLengthValidator() {
		return (control: UntypedFormControl) => {
			const value = control.value || '';
			if (value.length === 14 || value.length === 18 || value.length === 17) {
				return null;
			}
			return { invalidSmsLength: true };
		};
	}

	hasMethod(method: string): boolean {
		return this.methods.some((m) => m.method === method);
	}

	async submitRemoveMethod() {
		try {
			this.loading = true;
			await this.api.idpuser.disableTwoFactor(
				this.selectedMethodToDelete.methodId,
				this.form.get('code').value,
			);
		} catch (error) {
		} finally {
			this.methods = await this.api.idpuser.getTwoFactorMethods();
			this.selectedMethodToDelete = null;
			this.codeSent = false;
			this.method = null;
			this.loading = false;
		}
	}

	async submitCreateMethod(value) {
		try {
			this.loading = true;
			await this.api.idpuser.enableTwoFactor(
				this.method,
				this.form.get('contactInfo').value,
				this.form.get('code').value,
			);
		} catch (error) {
		} finally {
			const methods = await this.api.idpuser.getTwoFactorMethods();
			this.methods = methods;
			this.method = null;
			this.turnOn = false;
			this.codeSent = false;
			this.loading = false;
		}
	}
}
