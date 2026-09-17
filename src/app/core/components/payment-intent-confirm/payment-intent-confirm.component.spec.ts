import { MockBuilder, MockRender } from 'ng-mocks';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { DialogRef } from '@angular/cdk/dialog';
import { AccountService } from '@shared/services/account/account.service';
import { EventService } from '@shared/services/event/event.service';
import { PaymentIntentConfirmComponent } from './payment-intent-confirm.component';

describe('PaymentIntentConfirmComponent', () => {
	let mockAccountService: any;
	let mockEventService: any;
	let mockDialogRef: any;
	let mockRoute: any;
	let mockStripe: any;

	beforeEach(async () => {
		mockAccountService = {
			addStorageBytes: jasmine.createSpy('addStorageBytes'),
		};

		mockEventService = {
			dispatch: jasmine.createSpy('dispatch'),
		};

		mockDialogRef = {
			close: jasmine.createSpy('close'),
		};

		mockRoute = {
			snapshot: {
				queryParamMap: convertToParamMap({
					payment_intent_client_secret: 'pi_test_secret_abc',
				}),
			},
		};

		mockStripe = {
			retrievePaymentIntent: jasmine.createSpy('retrievePaymentIntent'),
		};

		await MockBuilder(PaymentIntentConfirmComponent)
			.keep(HttpClientTestingModule, { export: true })
			.provide({ provide: AccountService, useValue: mockAccountService })
			.provide({ provide: EventService, useValue: mockEventService })
			.provide({ provide: DialogRef, useValue: mockDialogRef })
			.provide({ provide: ActivatedRoute, useValue: mockRoute });
	});

	it('should create', () => {
		const fixture = MockRender(
			PaymentIntentConfirmComponent,
			{},
			{ detectChanges: false },
		);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('shows the missing state when no client secret query param is present', async () => {
		mockRoute.snapshot.queryParamMap = convertToParamMap({});

		const fixture = MockRender(PaymentIntentConfirmComponent);
		await fixture.whenStable();

		expect(fixture.point.componentInstance.stage).toBe('missing');
	});

	it('credits storage and shows success when the PaymentIntent succeeded', async () => {
		mockStripe.retrievePaymentIntent.and.returnValue(
			Promise.resolve({ paymentIntent: { status: 'succeeded', amount: 1000 } }),
		);

		// detectChanges: false — prevents ngOnInit from firing (and hitting the
		// real loadStripe()) before loadStripeClient is spied on below.
		const fixture = MockRender(
			PaymentIntentConfirmComponent,
			{},
			{ detectChanges: false },
		);
		spyOn(
			fixture.point.componentInstance,
			'loadStripeClient' as any,
		).and.returnValue(Promise.resolve(mockStripe));

		await fixture.point.componentInstance.ngOnInit();

		expect(mockAccountService.addStorageBytes).toHaveBeenCalledWith(1073741824);

		expect(fixture.point.componentInstance.stage).toBe('success');
	});

	it('shows the failure state when the PaymentIntent did not succeed', async () => {
		mockStripe.retrievePaymentIntent.and.returnValue(
			Promise.resolve({ paymentIntent: { status: 'requires_payment_method' } }),
		);

		const fixture = MockRender(
			PaymentIntentConfirmComponent,
			{},
			{ detectChanges: false },
		);
		spyOn(
			fixture.point.componentInstance,
			'loadStripeClient' as any,
		).and.returnValue(Promise.resolve(mockStripe));

		await fixture.point.componentInstance.ngOnInit();

		expect(mockAccountService.addStorageBytes).not.toHaveBeenCalled();
		expect(fixture.point.componentInstance.stage).toBe('failure');
	});

	it('closes the dialog when the close button is clicked', () => {
		const fixture = MockRender(
			PaymentIntentConfirmComponent,
			{},
			{ detectChanges: false },
		);
		fixture.point.componentInstance.onDoneClick();

		expect(mockDialogRef.close).toHaveBeenCalled();
	});
});
