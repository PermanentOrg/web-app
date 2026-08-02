import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogRef } from '@angular/cdk/dialog';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { AccountService } from '@shared/services/account/account.service';
import { EventService } from '@shared/services/event/event.service';
import { SecretsService } from '@shared/services/secrets/secrets.service';

const PRICE_PER_GB = 10;
const BYTES_PER_GIB = 1073741824;

type ConfirmationStage = 'loading' | 'success' | 'failure' | 'missing';

@Component({
	selector: 'pr-payment-intent-confirm',
	templateUrl: './payment-intent-confirm.component.html',
	standalone: false,
})
export class PaymentIntentConfirmComponent implements OnInit {
	public stage: ConfirmationStage = 'loading';
	public amountInGb = 0;

	constructor(
		private route: ActivatedRoute,
		private accountService: AccountService,
		private event: EventService,
		private dialogRef: DialogRef,
	) {}

	public onDoneClick(): void {
		this.dialogRef.close();
	}

	public async ngOnInit(): Promise<void> {
		const clientSecret = this.route.snapshot.queryParamMap.get(
			'payment_intent_client_secret',
		);

		if (!clientSecret) {
			this.stage = 'missing';
			return;
		}

		const stripe = await this.loadStripeClient();
		if (!stripe) {
			this.stage = 'failure';
			return;
		}

		const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

		if (paymentIntent?.status === 'succeeded') {
			const amountInUSD = Math.floor(paymentIntent.amount / 100);
			const sizeInBytes =
				Math.floor(amountInUSD / PRICE_PER_GB) * BYTES_PER_GIB;

			this.event.dispatch({ entity: 'account', action: 'purchase_storage' });
			this.accountService.addStorageBytes(sizeInBytes);
			this.amountInGb = Math.floor(amountInUSD / PRICE_PER_GB);
			this.stage = 'success';
		} else {
			this.stage = 'failure';
		}
	}

	protected async loadStripeClient(): Promise<Stripe | null> {
		return await loadStripe(SecretsService.getStatic('STRIPE_API_KEY'));
	}
}
