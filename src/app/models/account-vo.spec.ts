import { AccountVO } from './account-vo';

describe('AccountVO', () => {
	describe('phoneNeedsVerification', () => {
		it('should be true for an unverified phone number', () => {
			const account = new AccountVO({
				primaryPhone: '+15555550100',
				phoneStatus: 'status.auth.unverified',
			});

			expect(account.phoneNeedsVerification()).toBeTrue();
		});

		it('should be false for a verified phone number', () => {
			const account = new AccountVO({
				primaryPhone: '+15555550100',
				phoneStatus: 'status.auth.verified',
			});

			expect(account.phoneNeedsVerification()).toBeFalse();
		});

		it('should be false when the phone number was cleared but is still marked unverified', () => {
			const account = new AccountVO({
				primaryPhone: '',
				phoneStatus: 'status.auth.unverified',
			});

			expect(account.phoneNeedsVerification()).toBeFalse();
		});

		it('should be false when there is no phone number', () => {
			const account = new AccountVO({
				primaryPhone: null,
				phoneStatus: 'status.auth.none',
			});

			expect(account.phoneNeedsVerification()).toBeFalse();
		});
	});
});
