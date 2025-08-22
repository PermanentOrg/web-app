import { HttpClient } from '@angular/common/http';
import { Shallow } from 'shallow-render';
import { BillingPaymentVO } from '@models/billing-payment-vo';
import { BillingResponse } from '@shared/services/api/billing.repo';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { MessageService } from '@shared/services/message/message.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '@shared/services/event/event.service';
import { PledgeService } from '../../services/pledge.service';
import { ApiService } from '../../../shared/services/api/api.service';
import { PledgeModule } from '../../pledge.module';
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
	let shallow: Shallow<NewPledgeComponent>;

	beforeEach(() => {
		shallow = new Shallow(NewPledgeComponent, PledgeModule)
			.provide(HttpClient)
			.replaceModule(HttpClient, HttpClientTestingModule)
			.dontMock(HttpClientTestingModule)
			.mock(ApiService, mockApiService)
			.mock(AccountService, mockAccountService)
			.mock(PledgeService, mockPledgeService)
			.mock(MessageService, {
				showError: () => {},
			})
			.provide(EventService)
			.dontMock(EventService);
	});

	it('should exist', async () => {
		const { element } = await shallow.render();

		expect(element).not.toBeNull();
	});

	it('should enable the button if the data is correct', async () => {
		const { find, instance, fixture } = await shallow.render();
		const button = find('.btn-primary');

		instance.pledgeForm.patchValue({
			email: 'test@example.com',
			name: 'Test User',
		});

		instance.cardError = false;
		instance.cardComplete = true;

		instance.pledgeForm.updateValueAndValidity();

		fixture.detectChanges();

		expect(button.nativeElement.disabled).toBeFalsy();
	});

	it('should disabled the button if there is card form is not complete', async () => {
		const { find, instance, fixture } = await shallow.render();
		const button = find('.btn-primary');

		instance.pledgeForm.patchValue({
			email: 'test@example.com',
			name: 'Test User',
		});

		instance.cardError = false;
		instance.cardComplete = false;

		instance.pledgeForm.updateValueAndValidity();

		fixture.detectChanges();

		expect(button.nativeElement.disabled).toBeTruthy();
	});

	it('should disabled the button if the email is invalid', async () => {
		const { find, instance, fixture } = await shallow.render();
		const button = find('.btn-primary');

		instance.pledgeForm.patchValue({
			email: 'test',
			name: 'Test User',
		});

		instance.cardError = false;
		instance.cardComplete = true;

		instance.pledgeForm.updateValueAndValidity();

		fixture.detectChanges();

		expect(button.nativeElement.disabled).toBeTruthy();
	});

	it('should disabled the button if no name was provided', async () => {
		const { find, instance, fixture } = await shallow.render();
		const button = find('.btn-primary');

		instance.pledgeForm.patchValue({
			email: 'test@mail.com',
		});

		instance.cardError = false;
		instance.cardComplete = true;

		instance.pledgeForm.updateValueAndValidity();

		fixture.detectChanges();

		expect(button.nativeElement.disabled).toBeTruthy();
	});

	it('should set the correct amount when clicking on a button', async () => {
		const { find, instance } = await shallow.render();

		const buttons = find('.pledge-button');

		expect(buttons.length).toBe(4);

		buttons[1].triggerEventHandler('click', null);

		expect(instance.donationAmount).toBe(20);
	});

	it('should select the custom value for the last input when clicked on it', async () => {
		const { find, instance } = await shallow.render();

		const buttons = find('.pledge-button');

		expect(buttons.length).toBe(4);

		buttons[3].triggerEventHandler('click', null);

		expect(instance.donationSelection).toBe('custom');
	});

	it('should display the loading spinner', async () => {
		const { find, instance } = await shallow.render();

		instance.waiting = true;

		expect(find('pr-loading-spinner')).toBeTruthy();
	});

	it('should display the succes message if the transaction is succesful', async () => {
		const { find, instance, fixture } = await shallow.render();

		instance.isSuccessful = true;
		instance.amountInGb = 5;

		fixture.detectChanges();

		const displayedMessage = find('.success-message');

		expect(displayedMessage).toBeTruthy();
	});
});
