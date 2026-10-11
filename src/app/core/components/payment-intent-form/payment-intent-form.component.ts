import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
	loadStripe,
	Stripe,
	StripeElements,
	StripePaymentElement,
} from '@stripe/stripe-js';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { EventService } from '@shared/services/event/event.service';
import { SecretsService } from '@shared/services/secrets/secrets.service';

const PRICE_PER_GB = 10;
const BYTES_PER_GIB = 1073741824;

type PurchaseStage = 'amount' | 'payment' | 'success';

@Component({
	selector: 'pr-payment-intent-form',
	templateUrl: './payment-intent-form.component.html',
	styleUrls: ['./payment-intent-form.component.scss'],
	standalone: false,
})
export class PaymentIntentFormComponent implements OnDestroy {
	@ViewChild('customAmountInput') customAmountInput: ElementRef;

	public stage: PurchaseStage = 'amount';
	public amountLevels = [10, 20, 50];
	public amountSelection: number | 'custom' = 10;
	public customAmount = 10;
	public waiting = false;
	public errorMessage: string | null = null;
	public amountInGb = 0;

	private stripe: Stripe | null = null;
	private elements: StripeElements | null = null;
	private paymentElement: StripePaymentElement | null = null;
	private sizeInBytes = 0;
	private paymentElementContainerRef: ElementRef | undefined;

	constructor(
		private api: ApiService,
		private accountService: AccountService,
		private message: MessageService,
		private event: EventService,
	) {}

	@ViewChild('paymentElementContainer')
	get paymentElementContainer(): ElementRef | undefined {
		return this.paymentElementContainerRef;
	}

	set paymentElementContainer(ref: ElementRef | undefined) {
		this.paymentElementContainerRef = ref;
		if (ref && this.paymentElement) {
			this.paymentElement.mount(ref.nativeElement);
		}
	}

	public ngOnDestroy(): void {
		this.paymentElement?.unmount();
	}

	public chooseAmount(amount: number | 'custom'): void {
		this.amountSelection = amount;
		if (amount === 'custom') {
			this.customAmountInput?.nativeElement.focus();
		}
	}

	public getStorageAmount(amountInUSD: number): number {
		return Math.floor(amountInUSD / PRICE_PER_GB);
	}

	public getSelectedAmount(): number {
		return this.amountSelection === 'custom'
			? Number(this.customAmount)
			: this.amountSelection;
	}

	public async continueToPayment(): Promise<void> {
		const amountInUSD = Math.floor(this.getSelectedAmount());
		if (!amountInUSD || amountInUSD < 1) {
			return;
		}

		this.waiting = true;
		this.errorMessage = null;

		try {
			const response =
				await this.api.billing.createStoragePurchaseIntent(amountInUSD);
			this.sizeInBytes = this.getStorageAmount(amountInUSD) * BYTES_PER_GIB;

			this.stripe = await this.loadStripeClient();
			if (!this.stripe) {
				throw new Error('Unable to load Stripe.');
			}

			this.elements = this.stripe.elements({
				clientSecret: response.clientSecret,
			});
			this.paymentElement = this.elements.create('payment');

			this.stage = 'payment';
		} catch (err) {
			this.message.showError({ message: this.getRequestErrorMessage(err) });
		} finally {
			this.waiting = false;
		}
	}

	public async submitPayment(): Promise<void> {
		if (!this.stripe || !this.elements) {
			return;
		}

		this.waiting = true;
		this.errorMessage = null;

		const result = await this.stripe.confirmPayment({
			elements: this.elements,
			confirmParams: { return_url: this.buildReturnUrl() },
			redirect: 'if_required',
		});

		this.waiting = false;

		if (result.error) {
			this.errorMessage =
				result.error.message ?? 'Your payment could not be completed.';
			return;
		}

		this.event.dispatch({ entity: 'account', action: 'purchase_storage' });
		this.accountService.addStorageBytes(this.sizeInBytes);
		this.amountInGb = this.getStorageAmount(
			Math.floor(this.getSelectedAmount()),
		);
		this.stage = 'success';
	}

	protected async loadStripeClient(): Promise<Stripe | null> {
		return await loadStripe(SecretsService.getStatic('STRIPE_API_KEY'));
	}

	private buildReturnUrl(): string {
		return `${window.location.origin}/app/(private//dialog:storage-purchase-confirm)`;
	}

	private getRequestErrorMessage(err: any): string {
		return (
			err?.error?.errors?.[0]?.message ??
			'Something went wrong. Please try again.'
		);
	}
}
