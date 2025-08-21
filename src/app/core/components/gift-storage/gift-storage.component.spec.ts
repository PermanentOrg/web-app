import { Shallow } from 'shallow-render';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CoreModule } from '@core/core.module';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { of, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { GiftingResponse } from '@shared/services/api/billing.repo';
import { ApiService } from '@shared/services/api/api.service';
import { AccountVO } from '../../../models/account-vo';
import { GiftStorageComponent } from './gift-storage.component';

describe('GiftStorageComponent', () => {
	let shallow: Shallow<GiftStorageComponent>;
	let messageShown = false;

	const mockAccount = new AccountVO({ accountId: 1 });

	const mockAccountService = {
		getAccount: jasmine.createSpy('getAccount').and.returnValue({
			mockAccount,
		}),
		setAccount: jasmine.createSpy('setAccount'),
	};

	const mockDialog = jasmine.createSpyObj('DialogCdkService', ['open']);
	mockDialog.open.and.returnValue({
		closed: of(true),
	});

	const mockApiService = {
		billing: {
			giftStorage: jasmine.createSpy('giftStorage').and.returnValue(
				Promise.resolve(
					new GiftingResponse({
						storageGifted: 50,
						giftDelivered: ['test@example.com', 'test1@example.com'],
						invitationSent: ['test@example.com', 'test2@example.com'],
						alreadyInvited: [],
					}),
				),
			),
		},
	};

	beforeEach(() => {
		shallow = new Shallow(GiftStorageComponent, CoreModule)
			.provide([HttpClient, HttpHandler])
			.mock(AccountService, mockAccountService)
			.mock(MessageService, {
				showError: () => {
					messageShown = true;
				},
			})
			.mock(DialogCdkService, mockDialog)
			.mock(ApiService, mockApiService);
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('enables the "Send Gift Storage" button when the form is valid', async () => {
		const { find, instance, fixture } = await shallow.render();

		instance.availableSpace = '10';

		await instance.giftForm.controls.email.setValue('test@example.com');
		instance.giftForm.controls.amount.setValue('1');

		instance.isAsyncValidating = false;

		instance.giftForm.updateValueAndValidity();
		fixture.detectChanges();
		await fixture.whenStable();

		const button: HTMLButtonElement = find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(false);
	});

	it('disables the submit button if at least one email is not valid', async () => {
		const { find, instance, fixture } = await shallow.render();

		instance.availableSpace = '5';

		instance.giftForm.controls.email.setValue('test@example.com, test');
		instance.giftForm.controls.amount.setValue('1');

		instance.giftForm.updateValueAndValidity();
		fixture.detectChanges();

		const button: HTMLButtonElement = find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(true);
	});

	it('disables the submit button if the there is a duplicate email', async () => {
		const { find, instance, fixture } = await shallow.render();

		instance.availableSpace = '5';

		instance.giftForm.controls.email.setValue(
			'test@example.com, test@example.com',
		);
		instance.giftForm.controls.amount.setValue('1');

		instance.giftForm.updateValueAndValidity();
		fixture.detectChanges();

		const button: HTMLButtonElement = find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(true);
	});

	it('disables the submit button if the amount entered exceeds the available amount', async () => {
		const { find, instance, fixture } = await shallow.render();

		instance.availableSpace = '5';

		await instance.giftForm.controls.email.setValue('test@example.com');
		instance.giftForm.controls.amount.setValue('10');

		instance.giftForm.updateValueAndValidity();

		fixture.detectChanges();
		await fixture.whenStable();

		const button: HTMLButtonElement = find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(true);
	});

	it('displays the total amount gifted based on the number of emails', async () => {
		const { instance, fixture } = await shallow.render();

		instance.availableSpace = '5';

		await instance.giftForm.controls.email.setValue(
			'test@example.com,test1@example.com',
		);
		instance.giftForm.controls.amount.setValue('2');

		instance.giftForm.updateValueAndValidity();

		fixture.detectChanges();
		await fixture.whenStable();

		expect(instance.successMessage).toEqual('Total gifted storage: 4 GB');
	});

	it('disables the submit button if the amount multiplied by the number of emails exceeds the available amount', async () => {
		const { find, instance, fixture } = await shallow.render();

		instance.availableSpace = '5';

		await instance.giftForm.controls.email.setValue(
			'test@example.com,test1@example.com',
		);
		instance.giftForm.controls.amount.setValue('4');

		instance.giftForm.updateValueAndValidity();

		fixture.detectChanges();
		await fixture.whenStable();

		const button: HTMLButtonElement = find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(true);
	});

	it('parses the email string correctly', async () => {
		const { instance } = await shallow.render();

		const result = instance.parseEmailString(
			'test@example.com, test1@example.com',
		);

		expect(result).toEqual(['test@example.com', 'test1@example.com']);
	});

	it('returns all the duplicate emails', async () => {
		const { instance } = await shallow.render();

		const testEmailString =
			'test@example.com,test@example.com,test2@example.com';
		const expectedDuplicates = ['test@example.com'];
		const duplicates = await firstValueFrom(
			instance.checkForDuplicateEmails(testEmailString).pipe(take(1)),
		);

		expect(duplicates).toEqual(expectedDuplicates);
	});

	it('calls submitStorageGiftForm when the form is valid', async () => {
		const { instance } = await shallow.render();

		instance.giftForm.controls.email.setValue('test@example.com');
		instance.giftForm.controls.amount.setValue(5);
		instance.giftForm.updateValueAndValidity();

		spyOn(instance, 'submitStorageGiftForm').and.callThrough();

		instance.submitStorageGiftForm(instance.giftForm.value);

		expect(instance.submitStorageGiftForm).toHaveBeenCalledWith({
			email: 'test@example.com',
			amount: 5,
			message: '',
		});
	});

	it('filters out the duplicates from the giftDelivered and invitationSent of the response', async () => {
		const { instance, fixture } = await shallow.render();

		// Simulate setting form values and submission
		instance.giftForm.controls.email.setValue('test@example.com');
		instance.giftForm.controls.amount.setValue(5);
		instance.giftForm.updateValueAndValidity();

		instance.submitStorageGiftForm(instance.giftForm.value);

		await fixture.whenStable();

		expect(instance.emailsSentTo).toEqual([
			'test@example.com',
			'test2@example.com',
			'test1@example.com',
		]);
	});

	it('updates account details upon successful gift operation', async () => {
		const { instance, fixture } = await shallow.render();

		instance.availableSpace = '100'; // 100 GB

		instance.giftForm.controls.email.setValue('test@example.com');
		instance.giftForm.controls.amount.setValue('50');
		instance.giftForm.updateValueAndValidity();

		instance.submitStorageGiftForm(instance.giftForm.value);

		await fixture.whenStable();

		// Expect that setAccount was called on the AccountService
		expect(mockAccountService.setAccount).toHaveBeenCalled();
		expect(instance.availableSpace).toBe('50.00');
	});
});
