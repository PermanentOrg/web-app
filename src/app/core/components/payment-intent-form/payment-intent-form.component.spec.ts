import { MockBuilder, MockRender } from 'ng-mocks';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { EventService } from '@shared/services/event/event.service';
import { ApiService } from '@shared/services/api/api.service';
import { StoragePurchaseIntentResponse } from '@shared/services/api/billing.repo';
import { PaymentIntentFormComponent } from './payment-intent-form.component';

describe('PaymentIntentFormComponent', () => {
	let mockAccountService: any;
	let mockMessageService: any;
	let mockEventService: any;
	let mockApiService: any;
	let mockPaymentElement: any;
	let mockElements: any;
	let mockStripe: any;

	beforeEach(async () => {
		mockAccountService = {
			addStorageBytes: jasmine.createSpy('addStorageBytes'),
		};

		mockMessageService = {
			showError: jasmine.createSpy('showError'),
		};

		mockEventService = {
			dispatch: jasmine.createSpy('dispatch'),
		};

		mockApiService = {
			billing: {
				createStoragePurchaseIntent: jasmine
					.createSpy('createStoragePurchaseIntent')
					.and.returnValue(
						Promise.resolve(
							new StoragePurchaseIntentResponse({
								clientSecret: 'pi_test_secret_abc',
							}),
						),
					),
			},
		};

		mockPaymentElement = {
			mount: jasmine.createSpy('mount'),
			unmount: jasmine.createSpy('unmount'),
		};

		mockElements = {
			create: jasmine.createSpy('create').and.returnValue(mockPaymentElement),
		};

		mockStripe = {
			elements: jasmine.createSpy('elements').and.returnValue(mockElements),
			confirmPayment: jasmine.createSpy('confirmPayment'),
		};

		await MockBuilder(PaymentIntentFormComponent)
			.keep(HttpClientTestingModule, { export: true })
			.keep(FormsModule)
			.provide({ provide: AccountService, useValue: mockAccountService })
			.provide({ provide: MessageService, useValue: mockMessageService })
			.provide({ provide: EventService, useValue: mockEventService })
			.provide({ provide: ApiService, useValue: mockApiService });
	});

	it('should create', () => {
		const fixture = MockRender(PaymentIntentFormComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('creates a storage purchase intent and moves to the payment stage', async () => {
		const fixture = MockRender(PaymentIntentFormComponent);
		const instance = fixture.point.componentInstance;
		spyOn(instance, 'loadStripeClient' as any).and.returnValue(
			Promise.resolve(mockStripe),
		);

		instance.amountSelection = 10;
		await instance.continueToPayment();

		expect(
			mockApiService.billing.createStoragePurchaseIntent,
		).toHaveBeenCalledWith(10);

		expect(instance.stage).toBe('payment');
	});

	it('shows a toast error when creating the purchase intent fails', async () => {
		mockApiService.billing.createStoragePurchaseIntent.and.returnValue(
			Promise.reject({ error: { errors: [{ message: 'Card declined.' }] } }),
		);

		const fixture = MockRender(PaymentIntentFormComponent);
		const instance = fixture.point.componentInstance;

		instance.amountSelection = 10;
		await instance.continueToPayment();

		expect(mockMessageService.showError).toHaveBeenCalledWith({
			message: 'Card declined.',
		});

		expect(instance.stage).toBe('amount');
	});

	it('adds storage on a successful payment confirmation', async () => {
		mockStripe.confirmPayment.and.returnValue(
			Promise.resolve({ paymentIntent: { status: 'succeeded' } }),
		);

		const fixture = MockRender(PaymentIntentFormComponent);
		const instance = fixture.point.componentInstance;
		spyOn(instance, 'loadStripeClient' as any).and.returnValue(
			Promise.resolve(mockStripe),
		);

		instance.amountSelection = 10;
		await instance.continueToPayment();
		await instance.submitPayment();

		expect(mockAccountService.addStorageBytes).toHaveBeenCalledWith(1073741824);

		expect(mockEventService.dispatch).toHaveBeenCalledWith({
			entity: 'account',
			action: 'purchase_storage',
		});

		expect(instance.stage).toBe('success');
	});

	it('sets an inline error when Stripe returns an error', async () => {
		mockStripe.confirmPayment.and.returnValue(
			Promise.resolve({ error: { message: 'Your card was declined.' } }),
		);

		const fixture = MockRender(PaymentIntentFormComponent);
		const instance = fixture.point.componentInstance;
		spyOn(instance, 'loadStripeClient' as any).and.returnValue(
			Promise.resolve(mockStripe),
		);

		instance.amountSelection = 10;
		await instance.continueToPayment();
		await instance.submitPayment();

		expect(instance.errorMessage).toBe('Your card was declined.');
		expect(instance.stage).toBe('payment');
		expect(mockAccountService.addStorageBytes).not.toHaveBeenCalled();
	});

	it('unmounts the payment element on destroy', async () => {
		const fixture = MockRender(PaymentIntentFormComponent);
		const instance = fixture.point.componentInstance;
		spyOn(instance, 'loadStripeClient' as any).and.returnValue(
			Promise.resolve(mockStripe),
		);

		instance.amountSelection = 10;
		await instance.continueToPayment();

		instance.ngOnDestroy();

		expect(mockPaymentElement.unmount).toHaveBeenCalled();
	});
});
