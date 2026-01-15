import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
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
	const mockAccount = new AccountVO({ accountId: 1 });

	let mockAccountService: any;
	let mockDialog: any;
	let mockApiService: any;

	beforeEach(async () => {
		mockAccountService = {
			getAccount: jasmine.createSpy('getAccount').and.returnValue(mockAccount),
			setAccount: jasmine.createSpy('setAccount'),
		};

		mockDialog = jasmine.createSpyObj('DialogCdkService', ['open']);
		mockDialog.open.and.returnValue({
			closed: of(true),
		});

		mockApiService = {
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

		await MockBuilder(GiftStorageComponent)
			.keep(HttpClientTestingModule, { export: true })
			.keep(ReactiveFormsModule)
			.keep(UntypedFormBuilder)
			.provide({
				provide: AccountService,
				useValue: mockAccountService,
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: () => {},
				},
			})
			.provide({
				provide: DialogCdkService,
				useValue: mockDialog,
			})
			.provide({
				provide: ApiService,
				useValue: mockApiService,
			});
	});

	it('should create', () => {
		const fixture = MockRender(GiftStorageComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('enables the "Send Gift Storage" button when the form is valid', async () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		instance.availableSpace = '10';

		instance.giftForm.controls.email.setValue('test@example.com');
		instance.giftForm.controls.amount.setValue('1');

		instance.isAsyncValidating = false;

		instance.giftForm.updateValueAndValidity();
		fixture.detectChanges();
		await fixture.whenStable();

		const button: HTMLButtonElement =
			ngMocks.find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(false);
	});

	it('disables the submit button if at least one email is not valid', () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		instance.availableSpace = '5';

		instance.giftForm.controls.email.setValue('test@example.com, test');
		instance.giftForm.controls.amount.setValue('1');

		instance.giftForm.updateValueAndValidity();
		fixture.detectChanges();

		const button: HTMLButtonElement =
			ngMocks.find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(true);
	});

	it('disables the submit button if the there is a duplicate email', () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		instance.availableSpace = '5';

		instance.giftForm.controls.email.setValue(
			'test@example.com, test@example.com',
		);
		instance.giftForm.controls.amount.setValue('1');

		instance.giftForm.updateValueAndValidity();
		fixture.detectChanges();

		const button: HTMLButtonElement =
			ngMocks.find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(true);
	});

	it('disables the submit button if the amount entered exceeds the available amount', async () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		instance.availableSpace = '5';

		instance.giftForm.controls.email.setValue('test@example.com');
		instance.giftForm.controls.amount.setValue('10');

		instance.giftForm.updateValueAndValidity();

		fixture.detectChanges();
		await fixture.whenStable();

		const button: HTMLButtonElement =
			ngMocks.find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(true);
	});

	it('displays the total amount gifted based on the number of emails', async () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		instance.availableSpace = '5';

		instance.giftForm.controls.email.setValue(
			'test@example.com,test1@example.com',
		);
		instance.giftForm.controls.amount.setValue('2');

		instance.giftForm.updateValueAndValidity();

		fixture.detectChanges();
		await fixture.whenStable();

		expect(instance.successMessage).toEqual('Total gifted storage: 4 GB');
	});

	it('disables the submit button if the amount multiplied by the number of emails exceeds the available amount', async () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		instance.availableSpace = '5';

		instance.giftForm.controls.email.setValue(
			'test@example.com,test1@example.com',
		);
		instance.giftForm.controls.amount.setValue('4');

		instance.giftForm.updateValueAndValidity();

		fixture.detectChanges();
		await fixture.whenStable();

		const button: HTMLButtonElement =
			ngMocks.find('.btn-primary').nativeElement;

		expect(button.disabled).toBe(true);
	});

	it('parses the email string correctly', () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		const result = instance.parseEmailString(
			'test@example.com, test1@example.com',
		);

		expect(result).toEqual(['test@example.com', 'test1@example.com']);
	});

	it('returns all the duplicate emails', async () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		const testEmailString =
			'test@example.com,test@example.com,test2@example.com';
		const expectedDuplicates = ['test@example.com'];
		const duplicates = await firstValueFrom(
			instance.checkForDuplicateEmails(testEmailString).pipe(take(1)),
		);

		expect(duplicates).toEqual(expectedDuplicates);
	});

	it('calls submitStorageGiftForm when the form is valid', () => {
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

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
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

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
		const fixture = MockRender(GiftStorageComponent);
		const instance = fixture.point.componentInstance;

		instance.availableSpace = '100';

		instance.giftForm.controls.email.setValue('test@example.com');
		instance.giftForm.controls.amount.setValue('50');
		instance.giftForm.updateValueAndValidity();

		instance.submitStorageGiftForm(instance.giftForm.value);

		await fixture.whenStable();

		expect(mockAccountService.setAccount).toHaveBeenCalled();
		expect(instance.availableSpace).toBe('50.00');
	});
});
