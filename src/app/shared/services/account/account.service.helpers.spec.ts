import { AccountVO } from '@models/account-vo';
import {
	savePropertyOnAccount,
	AccountChange,
} from './account.service.helpers';

describe('savePropertyOnAccount', () => {
	let mockAccount: jasmine.SpyObj<AccountVO>;
	let mockApiService: any;
	let mockAccountService: any;
	let mockMessageService: any;

	beforeEach(() => {
		mockAccount = jasmine.createSpyObj<AccountVO>('AccountVO', ['update'], {
			primaryEmail: 'test@example.com',
			phoneStatus: 'status.auth.verified',
			primaryPhone: '1234567890',
		});

		mockApiService = {
			account: {
				update: jasmine.createSpy(),
			},
		};

		mockAccountService = {
			setAccount: jasmine.createSpy(),
		};

		mockMessageService = {
			showMessage: jasmine.createSpy(),
			showError: jasmine.createSpy(),
		};
	});

	it('should update the account and show success message on success', async () => {
		const change: AccountChange = { prop: 'primaryPhone', value: '9876543210' };

		mockApiService.account.update.and.resolveTo({
			primaryPhone: '9876543210',
			phoneStatus: 'status.auth.verified',
		});

		await savePropertyOnAccount(mockAccount, change, {
			messageService: mockMessageService,
			apiService: mockApiService,
			accountService: mockAccountService,
		});

		expect(mockAccount.update).toHaveBeenCalledWith(
			jasmine.objectContaining({
				primaryEmail: 'test@example.com',
				primaryPhone: '9876543210',
				phoneStatus: 'status.auth.verified',
			}),
		);

		expect(mockApiService.account.update).toHaveBeenCalledWith(
			jasmine.objectContaining({
				primaryEmail: 'test@example.com',
				primaryPhone: '9876543210',
				phoneStatus: 'status.auth.verified',
			}),
		);

		expect(mockAccountService.setAccount).toHaveBeenCalledWith(mockAccount);
		expect(mockMessageService.showMessage).toHaveBeenCalledWith({
			message: 'Account information saved.',
			style: 'success',
		});
	});

	it('should revert changes and show error message on failure', async () => {
		const change: AccountChange = { prop: 'primaryPhone', value: '9876543210' };

		mockApiService.account.update.and.rejectWith(new Error('API Error'));

		await savePropertyOnAccount(mockAccount, change, {
			messageService: mockMessageService,
			apiService: mockApiService,
			accountService: mockAccountService,
		});

		expect(mockAccount.update).toHaveBeenCalledWith({
			[change.prop]: '1234567890',
		});

		expect(mockMessageService.showError).toHaveBeenCalledWith({
			message: 'There was a problem saving your account changes',
		});
	});

	it('should set phoneStatus to unverified when primaryPhone is cleared', async () => {
		const change = {
			prop: 'primaryPhone' as keyof AccountVO,
			value: '',
		};

		mockApiService.account.update.and.returnValue(
			Promise.resolve({
				primaryPhone: '',
				phoneStatus: 'status.auth.unverified',
			}),
		);

		await savePropertyOnAccount(mockAccount, change, {
			messageService: mockMessageService,
			apiService: mockApiService,
			accountService: mockAccountService,
		});

		expect(mockAccount.update).toHaveBeenCalledWith(
			jasmine.objectContaining({
				primaryPhone: '',
				phoneStatus: 'status.auth.unverified',
				primaryEmail: 'test@example.com',
			}),
		);

		expect(mockApiService.account.update).toHaveBeenCalledWith(
			jasmine.objectContaining({
				primaryPhone: '',
				phoneStatus: 'status.auth.unverified',
				primaryEmail: 'test@example.com',
			}),
		);

		expect(mockAccount.update).toHaveBeenCalledWith(
			jasmine.objectContaining({
				primaryPhone: '',
				phoneStatus: 'status.auth.unverified',
			}),
		);

		expect(mockMessageService.showMessage).toHaveBeenCalledWith({
			message: 'Account information saved.',
			style: 'success',
		});
	});
});
