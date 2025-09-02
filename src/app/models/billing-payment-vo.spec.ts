import { BillingPaymentVO, BillingPaymentVOData } from './billing-payment-vo';

describe('BillingPaymentVO', () => {
	describe('default values', () => {
		it('should preserve certain defaults when both properties are undefined', () => {
			const voData: BillingPaymentVOData = {
				currency: undefined,
				refTableToIncrease: undefined,
			};

			const vo = new BillingPaymentVO(voData);

			expect(vo.currency).toBe('USD');
			expect(vo.refTableToIncrease).toBe('account');
		});

		it('should preserve defaults when properties are not provided at all', () => {
			const voData: BillingPaymentVOData = {};

			const vo = new BillingPaymentVO(voData);

			expect(vo.currency).toBe('USD');
			expect(vo.refTableToIncrease).toBe('account');
		});

		it('should override properties with defaults when values are provided', () => {
			const voData: BillingPaymentVOData = {
				currency: 'GBP',
				refTableToIncrease: 'billing',
			};

			const vo = new BillingPaymentVO(voData);

			expect(vo.currency).toBe('GBP');
			expect(vo.refTableToIncrease).toBe('billing');
		});

		it('should mix defaults and overrides correctly', () => {
			const voData: BillingPaymentVOData = {
				currency: 'CAD',
				refTableToIncrease: undefined,
			};

			const vo = new BillingPaymentVO(voData);

			expect(vo.currency).toBe('CAD');
			expect(vo.refTableToIncrease).toBe('account');
		});
	});
});
