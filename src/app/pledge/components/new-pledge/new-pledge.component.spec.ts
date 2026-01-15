import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BillingPaymentVO } from '@models/billing-payment-vo';
import { BillingResponse } from '@shared/services/api/billing.repo';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { MessageService } from '@shared/services/message/message.service';
import { EventService } from '@shared/services/event/event.service';
import { PledgeService } from '../../services/pledge.service';
import { ApiService } from '../../../shared/services/api/api.service';
import { NewPledgeComponent } from './new-pledge.component';

const mockPromoData = {
	Results: [
		{
			data: [
				{
					PromoVO: {
						promoId: 13,
						code: 'promo9',
						sizeInMB: 5000,
					},
				},
			],
		},
	],
	isSuccessful: true,
};

const mockAccountService = {
	refreshAccount: async (): Promise<void> => await Promise.resolve(),
	setAccount: (account: AccountVO): void => {},
	getAccount: (): AccountVO =>
		new AccountVO({ spaceLeft: 10000, spaceTotal: 10000, accountId: 1 }),
	isLoggedIn: (): boolean => true,
};

const mockPledgeService = {
	loadPledge: async (id): Promise<any> => await Promise.resolve(),
	createBillingPaymentVo: (account: AccountVO): BillingPaymentVO =>
		new BillingPaymentVO({ spaceAmountInGb: 5 }),
	linkAccount: async (account: AccountVO): Promise<void> =>
		await Promise.resolve(),
};

const mockApiService = {
	billing: {
		claimPledge: async (
			billingPaymentVO: BillingPaymentVO,
			pledgeId: string,
		): Promise<BillingResponse> =>
			await Promise.resolve(new BillingResponse(mockPromoData)),
	},
};

describe('NewPledgeComponent', () => {
	let fixture: ComponentFixture<NewPledgeComponent>;
	let instance: NewPledgeComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientTestingModule,
				ReactiveFormsModule,
				RouterTestingModule,
			],
			declarations: [NewPledgeComponent],
			providers: [
				{ provide: ApiService, useValue: mockApiService },
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: PledgeService, useValue: mockPledgeService },
				{ provide: MessageService, useValue: { showError: () => {} } },
				EventService,
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(NewPledgeComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should exist', async () => {
		expect(fixture.nativeElement).not.toBeNull();
	});

	it('should enable the button if the data is correct', async () => {
		const button = fixture.nativeElement.querySelector('.btn-primary');

		instance.pledgeForm.patchValue({
			email: 'test@example.com',
			name: 'Test User',
		});

		instance.cardError = false;
		instance.cardComplete = true;

		instance.pledgeForm.updateValueAndValidity();

		fixture.detectChanges();

		expect(button.disabled).toBeFalsy();
	});

	it('should disabled the button if there is card form is not complete', async () => {
		const button = fixture.nativeElement.querySelector('.btn-primary');

		instance.pledgeForm.patchValue({
			email: 'test@example.com',
			name: 'Test User',
		});

		instance.cardError = false;
		instance.cardComplete = false;

		instance.pledgeForm.updateValueAndValidity();

		fixture.detectChanges();

		expect(button.disabled).toBeTruthy();
	});

	it('should disabled the button if the email is invalid', async () => {
		const button = fixture.nativeElement.querySelector('.btn-primary');

		instance.pledgeForm.patchValue({
			email: 'test',
			name: 'Test User',
		});

		instance.cardError = false;
		instance.cardComplete = true;

		instance.pledgeForm.updateValueAndValidity();

		fixture.detectChanges();

		expect(button.disabled).toBeTruthy();
	});

	it('should disabled the button if no name was provided', async () => {
		const button = fixture.nativeElement.querySelector('.btn-primary');

		instance.pledgeForm.patchValue({
			email: 'test@mail.com',
		});

		instance.cardError = false;
		instance.cardComplete = true;

		instance.pledgeForm.updateValueAndValidity();

		fixture.detectChanges();

		expect(button.disabled).toBeTruthy();
	});

	it('should set the correct amount when clicking on a button', async () => {
		const buttons = fixture.nativeElement.querySelectorAll('.pledge-button');

		expect(buttons.length).toBe(4);

		buttons[1].click();

		expect(instance.donationAmount).toBe(20);
	});

	it('should select the custom value for the last input when clicked on it', async () => {
		const buttons = fixture.nativeElement.querySelectorAll('.pledge-button');

		expect(buttons.length).toBe(4);

		buttons[3].click();

		expect(instance.donationSelection).toBe('custom');
	});

	it('should display the loading spinner', async () => {
		instance.waiting = true;
		fixture.detectChanges();

		expect(
			fixture.nativeElement.querySelector('pr-loading-spinner'),
		).toBeTruthy();
	});

	it('should display the succes message if the transaction is succesful', async () => {
		instance.isSuccessful = true;
		instance.amountInGb = 5;

		fixture.detectChanges();

		const displayedMessage =
			fixture.nativeElement.querySelector('.success-message');

		expect(displayedMessage).toBeTruthy();
	});
});
