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

		expect(mockAccount.update).toHaveBeenCalledWith({
			primaryEmail: 'test@example.com',
			primaryPhone: '9876543210',
		});

		expect(mockApiService.account.update).toHaveBeenCalledWith({
			primaryEmail: 'test@example.com',
			primaryPhone: '9876543210',
		});

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

	it('should leave phoneStatus to the server when primaryPhone is cleared', async () => {
		const change: AccountChange = { prop: 'primaryPhone', value: '' };
		const serverResponse = {
			primaryPhone: '',
			phoneStatus: 'status.auth.unverified',
		};

		mockApiService.account.update.and.resolveTo(serverResponse);

		await savePropertyOnAccount(mockAccount, change, {
			messageService: mockMessageService,
			apiService: mockApiService,
			accountService: mockAccountService,
		});

		expect(mockApiService.account.update).toHaveBeenCalledWith({
			primaryEmail: 'test@example.com',
			primaryPhone: '',
		});

		expect(mockAccount.update).toHaveBeenCalledWith(serverResponse);

		expect(mockMessageService.showMessage).toHaveBeenCalledWith({
			message: 'Account information saved.',
			style: 'success',
		});
	});
});
