import { AccountVO } from '@models/account-vo';
import { vi } from 'vitest';

import {
	savePropertyOnAccount,
	AccountChange,
} from './account.service.helpers';

describe('savePropertyOnAccount', () => {
	let mockAccount: any;
	let mockApiService: any;
	let mockAccountService: any;
	let mockMessageService: any;

	beforeEach(() => {
		mockAccount = { update: vi.fn(), primaryEmail: 'test@example.com',
			phoneStatus: 'status.auth.verified',
			primaryPhone: '1234567890', } as any;

		mockApiService = {
			account: {
				update: vi.fn(),
			},
		};

		mockAccountService = {
			setAccount: vi.fn(),
		};

		mockMessageService = {
			showMessage: vi.fn(),
			showError: vi.fn(),
		};
	});

	it('should update the account and show success message on success', async () => {
		const change: AccountChange = { prop: 'primaryPhone', value: '9876543210' };

		mockApiService.account.update.mockResolvedValue({
			primaryPhone: '9876543210',
			phoneStatus: 'status.auth.verified',
		});

		await savePropertyOnAccount(mockAccount, change, {
			messageService: mockMessageService,
			apiService: mockApiService,
			accountService: mockAccountService,
		});

		expect(mockAccount.update).toHaveBeenCalledWith(
			expect.objectContaining({
				primaryEmail: 'test@example.com',
				primaryPhone: '9876543210',
				phoneStatus: 'status.auth.verified',
			}),
		);

		expect(mockApiService.account.update).toHaveBeenCalledWith(
			expect.objectContaining({
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

		mockApiService.account.update.mockRejectedValue(new Error('API Error'));

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

		mockApiService.account.update.mockReturnValue(
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
			expect.objectContaining({
				primaryPhone: '',
				phoneStatus: 'status.auth.unverified',
				primaryEmail: 'test@example.com',
			}),
		);

		expect(mockApiService.account.update).toHaveBeenCalledWith(
			expect.objectContaining({
				primaryPhone: '',
				phoneStatus: 'status.auth.unverified',
				primaryEmail: 'test@example.com',
			}),
		);

		expect(mockAccount.update).toHaveBeenCalledWith(
			expect.objectContaining({
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
