import {
	Component,
	OnInit,
	ElementRef,
	ViewChild,
	AfterViewInit,
	Input,
} from '@angular/core';
import {
	UntypedFormGroup,
	UntypedFormBuilder,
	Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { environment } from '@root/environments/environment';
import { SecretsService } from '@shared/services/secrets/secrets.service';
import { PledgeService } from '@pledge/services/pledge.service';
import { IFrameService } from '@shared/services/iframe/iframe.service';
import { HttpClient } from '@angular/common/http';
import { EventService } from '@shared/services/event/event.service';

const stripe = window.Stripe(SecretsService.getStatic('STRIPE_API_KEY'));
const elements = stripe.elements();

@Component({
	selector: 'pr-new-pledge',
	templateUrl: './new-pledge.component.html',
	styleUrls: ['./new-pledge.component.scss'],
	standalone: false,
})
export class NewPledgeComponent implements OnInit, AfterViewInit {
	@Input() inlineFlow: boolean = false;
	public waiting: boolean = false;
	public pledgeForm: UntypedFormGroup;

	public donationLevels = [10, 20, 50];

	public donationSelection: any = 10;
	public donationAmount = 10;

	public pricePerGb = 10;
	public isSuccessful: boolean = false;

	@ViewChild('customDonationAmount', { static: true })
	customDonationInput: ElementRef;

	@ViewChild('card', { static: true }) elementsContainer: ElementRef;
	stripeElementsCard: any;
	cardError: any;
	cardComplete = false;

	public static stripeCardInstance: any;
	public static currentInstance: NewPledgeComponent;
	public amountInGb: number = 0;

	constructor(
		private api: ApiService,
		private fb: UntypedFormBuilder,
		private router: Router,
		private accountService: AccountService,
		private route: ActivatedRoute,
		private message: MessageService,
		private http: HttpClient,
		private iframe: IFrameService,
		private pledgeService: PledgeService,
		private event: EventService,
	) {
		NewPledgeComponent.currentInstance = this;
		this.initStripeElements();
		const account = this.accountService.getAccount();

		this.pledgeForm = this.fb.group({
			email: [
				account ? account.primaryEmail : '',
				[Validators.required, Validators.email],
			],
			customDonationAmount: [''],
			name: [account ? account.fullName : '', [Validators.required]],
		});
	}

	onPledgeClick(amount: number) {
		this.chooseDonationAmount('custom');
		this.pledgeForm.patchValue({
			customDonationAmount: amount,
		});
	}

	ngOnInit() {
		let pledgeAmount;
		if (this.iframe.isIFrame()) {
			const url = document.referrer;
			const split = url.split('?');
			if (split.length > 1) {
				const params = split.pop();
				if (params.includes('amount')) {
					try {
						pledgeAmount = parseInt(params.split('=').pop(), 0);
					} catch (err) {}
				}
			}
		} else {
			const params = this.route.snapshot.queryParams;
			if (params) {
				pledgeAmount = parseInt(params.pledgeAmount, 10);
			}
		}
		if (pledgeAmount) {
			if (this.donationLevels.includes(pledgeAmount)) {
				this.chooseDonationAmount(pledgeAmount);
			} else {
				this.donationAmount = pledgeAmount;
				this.chooseDonationAmount('custom');
			}
		}
		this.event.dispatch({
			action: 'open_storage_modal',
			entity: 'account',
		});
	}

	ngAfterViewInit() {
		this.bindStripeElements();
	}

	initStripeElements() {
		if (NewPledgeComponent.stripeCardInstance) {
			this.stripeElementsCard = NewPledgeComponent.stripeCardInstance;
			return;
		}
		const options = {
			classes: {
				invalid: '.ng-invalid',
			},
			style: {
				base: {
					fontSize: '16px',
					fontFamily:
						'Open Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
					'::placeholder:': {
						color: '#6c757d',
					},
				},
			},
		};
		this.stripeElementsCard = elements.create('card', options);

		this.stripeElementsCard?.addEventListener('change', (event) => {
			const instance = NewPledgeComponent.currentInstance;
			if (event.error) {
				instance.cardError = event.error.message;
			} else {
				instance.cardError = null;
			}

			if (event.complete) {
				instance.cardComplete = true;
			} else {
				instance.cardComplete = false;
			}
		});

		NewPledgeComponent.stripeCardInstance = this.stripeElementsCard;
	}

	bindStripeElements() {
		this.stripeElementsCard?.mount(this.elementsContainer.nativeElement);
	}

	getStorageAmount(donationAmount: number) {
		return Math.floor(donationAmount / this.pricePerGb);
	}

	chooseDonationAmount(amount: any) {
		this.donationSelection = amount;
		if (amount === 'custom') {
			if (!this.pledgeForm.value.customDonationAmount) {
				this.pledgeForm.patchValue({
					customDonationAmount: this.donationAmount,
				});
			}
			this.customDonationInput.nativeElement.focus();
		} else {
			this.donationAmount = parseInt(amount, 10);
		}
	}

	async submitPledge(formValue: any) {
		this.cardError = false;
		this.waiting = true;

		const stripeResult = await stripe.createToken(this.stripeElementsCard, {
			name: formValue.name,
		});

		if (stripeResult.error) {
			this.waiting = false;
			this.cardError = stripeResult.error.message;
			return;
		}

		let pledge: PledgeData = {
			email: formValue.email,
			dollarAmount:
				this.donationSelection === 'custom'
					? formValue.customDonationAmount
					: this.donationAmount,
			name: formValue.name,
			stripeToken: stripeResult.token.id,
			zip: stripeResult.token.card?.address_zip,
			timestamp: new Date().getTime(),
			client: 'Web App',
		};

		try {
			const body = await this.http
				.post(`${environment.firebase.functionsURL}/donation/charge`, pledge)
				.toPromise();

			pledge = body as PledgeData;
		} catch (err) {
			this.waiting = false;
			switch (err.code) {
				case 'card_declined':
					this.cardError = 'Your card was declined.';
					break;
				default:
					this.cardError = 'This card could not be charged.';
			}
			return;
		}

		this.stripeElementsCard.clear();
		this.pledgeForm.patchValue({
			email: null,
			name: null,
		});
		this.pledgeForm.reset();

		const isLoggedIn = this.accountService.isLoggedIn();
		if (isLoggedIn) {
			if (this.inlineFlow) {
				this.waiting = true;

				await this.pledgeService.loadPledge(pledge.id);

				const pledgeId = pledge.id;
				const account = this.accountService.getAccount();
				const payment = this.pledgeService.createBillingPaymentVo(account);
				const amount = pledge.dollarAmount;
				const sizeInBytes = this.getSizeInBytes(amount);

				try {
					await this.pledgeService.linkAccount(account);
					const billingResponse = await this.api.billing.claimPledge(
						payment,
						pledgeId,
					);
					this.waiting = false;
					if (billingResponse.isSuccessful) {
						this.event.dispatch({
							entity: 'account',
							action: 'purchase_storage',
						});
						this.isSuccessful = true;
						this.accountService.addStorageBytes(sizeInBytes);
						this.message.showMessage({
							message: `You just claimed ${this.getStorageAmount(
								pledge.dollarAmount,
							)} GB of storage!`,
							style: 'success',
						});
						this.amountInGb = this.getStorageAmount(pledge.dollarAmount);
					}
				} catch (err) {
					this.waiting = false;
					throw err;
				} finally {
					this.pledgeService.reset();
				}
			} else {
				this.router.navigate(['..', 'claimlogin'], { relativeTo: this.route });
			}
		} else {
			this.router.navigate(['..', 'claim'], { relativeTo: this.route });
		}
		this.waiting = false;
	}

	unfocusOnEnter(event: KeyboardEvent) {
		if (event.keyCode === 13) {
			this.customDonationInput.nativeElement.blur();
			event.stopPropagation();
			event.preventDefault();
		}
	}

	private getSizeInBytes(amount: number): number {
		const bytesInGiB = 1073741824;
		return Math.floor(amount / 10) * bytesInGiB;
	}
}

export interface PledgeData {
	email: string;
	dollarAmount: number;
	name?: string;
	stripeToken?: string;
	stripeCustomerId?: string;
	timestamp?: number;
	accountId?: number;
	claimed?: boolean;
	anonymous?: boolean;
	zip?: string;
	id?: string;
	paid?: boolean;
	stripeChargeId?: string;
	client?: 'Web App';
}
