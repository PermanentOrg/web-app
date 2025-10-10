import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	AfterViewInit,
} from '@angular/core';
import { UserData } from '@pledge/models/user-data';
import firebase from 'firebase/compat/app';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { SecretsService } from '@shared/services/secrets/secrets.service';

const stripe = window.Stripe(SecretsService.getStatic('STRIPE_API_KEY'));
const elements = stripe.elements();

@Component({
	selector: 'pr-update-card',
	templateUrl: './update-card.component.html',
	styleUrls: ['./update-card.component.scss'],
	standalone: false,
})
export class UpdateCardComponent implements OnInit, AfterViewInit {
	userId: string;
	userData: UserData;

	@ViewChild('card', { static: true }) elementsContainer: ElementRef;
	stripeElementsCard: any;
	cardError: any;
	cardComplete = false;

	nameControl = new UntypedFormControl('', [Validators.required]);

	cardSaved = false;
	waiting = false;

	constructor(
		private route: ActivatedRoute,
		private db: AngularFireDatabase,
		private message: MessageService,
	) {
		this.initStripeElements();
		this.userId = this.route.snapshot.params.userId;
	}

	async ngOnInit() {
		this.userData = (
			await this.db.database.ref('/users').child(this.userId).once('value')
		).val() as UserData;
	}

	ngAfterViewInit() {
		this.bindStripeElements();
	}

	initStripeElements() {
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

		this.stripeElementsCard.addEventListener('change', (event) => {
			if (event.error) {
				this.cardError = event.error.message;
			} else {
				this.cardError = null;
			}

			if (event.complete) {
				this.cardComplete = true;
			} else {
				this.cardComplete = false;
			}
		});
	}

	bindStripeElements() {
		this.stripeElementsCard.mount(this.elementsContainer.nativeElement);
	}

	async saveCard() {
		this.waiting = true;

		const stripeResult = await stripe.createToken(this.stripeElementsCard, {
			name: this.nameControl.value,
		});

		if (stripeResult.error) {
			this.waiting = false;
			this.cardError = stripeResult.error.message;
			return;
		}

		const token = stripeResult.token.id;

		const updateUser = firebase
			.functions()
			.httpsCallable('updateUserPaymentMethod');

		const result = await updateUser({
			userId: this.userId,
			email: this.userData.email,
			stripeToken: token,
		});
		this.waiting = false;
		if (result.data) {
			this.message.showMessage({
				message: 'Payment method updated successfully.',
				style: 'success',
			});
			this.cardSaved = true;
			this.nameControl.reset();
		} else {
			this.message.showError({
				message:
					'There was an issue saving your payment information. Please try again.',
			});
		}
	}
}
