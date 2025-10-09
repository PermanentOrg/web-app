import { Component, OnDestroy } from '@angular/core';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
	AbstractControl,
	AsyncValidatorFn,
	FormControl,
	ValidationErrors,
	ValidatorFn,
} from '@angular/forms';
import { AccountVO } from '@models/index';
import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { GiftingResponse } from '@shared/services/api/billing.repo';
import {
	Observable,
	BehaviorSubject,
	Subscription,
	of,
	timer,
	forkJoin,
} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '../../../shared/services/account/account.service';
import { ConfirmGiftDialogComponent } from '../confirm-gift-dialog/confirm-gift-dialog.component';

@Component({
	selector: 'pr-gift-storage',
	templateUrl: './gift-storage.component.html',
	styleUrls: ['./gift-storage.component.scss'],
	standalone: false,
})
export class GiftStorageComponent implements OnDestroy {
	giftForm: UntypedFormGroup;
	availableSpace: string;
	account: AccountVO;
	bytesPerGigabyte = 1073741824;
	emailValidationErrors: string[] = [];
	duplicateEmails: string[] = [];

	public isSuccessful: boolean = false;
	public giftResult: BehaviorSubject<{
		isSuccessful: boolean;
		response: GiftingResponse | null;
	}> = new BehaviorSubject<{
		isSuccessful: boolean;
		response: GiftingResponse | null;
	}>({ isSuccessful: false, response: null });
	private subscriptions: Subscription[] = [];
	public isAsyncValidating: boolean;
	public successMessage: string = '';
	public emailsSentTo: string[] = [];
	public alreadyInvited: string[] = [];

	constructor(
		private fb: UntypedFormBuilder,
		private accountService: AccountService,
		private dialog: DialogCdkService,
		private api: ApiService,
		private msg: MessageService,
	) {
		this.account = this.accountService.getAccount();
		this.availableSpace = this.bytesToGigabytes(this.account?.spaceLeft);
		this.giftForm = this.fb.group({
			email: [
				'',
				{
					validators: [Validators.required],
					asyncValidators: [this.combinedEmailValidator()],
					updateOn: 'change',
				},
			],
			amount: [
				'',
				{
					validators: [
						Validators.required,
						Validators.min(0),
						Validators.max(Number(this.availableSpace)),
						this.integerValidator,
						this.giftedAmountValidator(),
					],
					updateOn: 'change',
				},
			],
			message: ['', []],
		});
		this.subscriptions.push(
			this.giftForm.get('email')?.valueChanges.subscribe((value) => {
				this.successMessage = '';
				this.giftForm.get('amount')?.updateValueAndValidity();

				if (!value) {
					if (this.emailValidationErrors.length) {
						this.emailValidationErrors = [];
					}
					if (this.duplicateEmails.length) {
						this.duplicateEmails = [];
					}
				}
			}),
		);
	}

	ngOnDestroy(): void {
		unsubscribeAll(this.subscriptions);
	}

	submitStorageGiftForm(value: {
		email: string;
		amount: number;
		message: string;
	}) {
		const emails = this.parseEmailString(value.email);
		this.dialog
			.open(ConfirmGiftDialogComponent, {
				data: {
					emails,
					amount: value.amount,
					message: value.message,
					giftResult: this.giftResult,
				},
				width: '700px',
			})
			.closed.subscribe(async (confirm) => {
				try {
					if (confirm) {
						const response = await this.api.billing.giftStorage(
							emails,
							Number(value.amount),
							value.message,
						);

						this.emailsSentTo = [
							...new Set([
								...response.invitationSent,
								...response.giftDelivered,
							]),
						];
						this.alreadyInvited = response.alreadyInvited;
						const giftedAmount = response.storageGifted;
						const remainingSpaceAfterGift =
							Number(this.availableSpace) - giftedAmount;
						this.availableSpace = String(remainingSpaceAfterGift.toFixed(2));

						const remainingSpaceInBytes =
							remainingSpaceAfterGift * this.bytesPerGigabyte;

						const totalSpace =
							this.account.spaceTotal - giftedAmount * this.bytesPerGigabyte;

						const newAccount = new AccountVO({
							...this.account,
							spaceLeft: remainingSpaceInBytes,
							spaceTotal: totalSpace,
						});

						this.accountService.setAccount(newAccount);
						this.isSuccessful = true;
					}
				} catch (e) {
					this.msg.showError({
						message: 'Something went wrong! Please try again.',
					});
					this.giftResult.next({ isSuccessful: false, response: null });
				}
			});
	}

	closeSuccessMessage() {
		this.giftForm.reset();
		this.isSuccessful = false;
	}

	bytesToGigabytes(bytes: number): string {
		return (bytes / this.bytesPerGigabyte).toFixed(2);
	}

	integerValidator(control: FormControl) {
		if (!control.value) {
			return null;
		}

		const isInteger = Number.isInteger(Number(control.value));
		const hasDecimalPoint = control.value.toString().includes('.');

		return isInteger && !hasDecimalPoint ? null : { notInteger: true };
	}

	private validateEmails(controlValue: string): Observable<string[] | null> {
		const emails = this.parseEmailString(controlValue);

		const invalidEmails = emails.filter((email) => {
			const tempEmailControl = new FormControl(email, Validators.email);
			return tempEmailControl.invalid;
		});

		return of(invalidEmails.length ? invalidEmails : null);
	}

	private combinedEmailValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			if (!control.value) {
				this.emailValidationErrors = [];
				this.duplicateEmails = [];
				return of(null);
			}

			this.isAsyncValidating = true;

			return timer(1000).pipe(
				switchMap(() =>
					forkJoin({
						invalidEmails: this.validateEmails(control.value),
						duplicateEmails: this.checkForDuplicateEmails(control.value),
					}),
				),
				map(({ invalidEmails, duplicateEmails }) => {
					this.emailValidationErrors = invalidEmails || [];
					this.duplicateEmails = duplicateEmails || [];
					this.isAsyncValidating = false;

					let errors: ValidationErrors | null = null;

					if (invalidEmails?.length > 0) {
						errors = { ...errors, invalidEmails: true };
					}
					if (duplicateEmails?.length > 0) {
						errors = { ...errors, duplicateEmails: true };
					}

					return errors;
				}),
			);
		};
	}

	private giftedAmountValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const emailControl = control.parent?.get('email');
			if (!control.value || !emailControl.value) {
				this.successMessage = '';
				return null;
			}

			if (emailControl) {
				const emails = this.parseEmailString(emailControl.value as string);
				const numberOfEmails = emails.length;
				const giftedAmount = numberOfEmails * Number(control.value);
				const availableSpace = Number(this.availableSpace);
				if (giftedAmount <= availableSpace) {
					this.successMessage = `Total gifted storage: ${giftedAmount} GB`;
				} else {
					this.successMessage = '';

					return {
						isGreaterThanAvailableSpace: true,
						requiredSpace: giftedAmount,
					};
				}
			}

			return null;
		};
	}

	public parseEmailString(emailString: string): string[] {
		return emailString.split(',').map((email) => email.trim());
	}

	public getAmountErrorMessage(): string | null {
		const errors = this.giftForm.get('amount')?.errors;
		if (errors?.isGreaterThanAvailableSpace) {
			const requiredSpace = errors.requiredSpace;
			return `You need at least ${requiredSpace} GB.`;
		}
		return null;
	}

	public checkForDuplicateEmails(
		emailsString: string,
	): Observable<string[] | null> {
		const emails = this.parseEmailString(emailsString);
		const emailCount = {};
		const duplicates: string[] = [];

		emails.forEach((email) => {
			if (emailCount[email]) {
				emailCount[email]++;
			} else {
				emailCount[email] = 1;
			}
		});

		Object.keys(emailCount).forEach((key) => {
			if (emailCount[key] > 1) {
				const mailControl = new FormControl(key, Validators.email);
				if (mailControl.valid) {
					duplicates.push(key);
				}
			}
		});

		return of(duplicates.length ? duplicates : null);
	}
}
