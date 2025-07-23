import { AccountVO } from '@models/account-vo';
import { PromoVOData } from '@models/promo-vo';
import { ClaimingPromoResponse } from '@shared/services/api/billing.repo';

const mockPromoResponse = [
	{
		promoId: 13,
		code: 'promo9',
		sizeInMB: 5000,
	},
];
const failedPromoResponse = {
	Results: [
		{
			data: null,
			message: ['warning.promo.not_found'],
			status: false,
		},
	],
	isSuccessful: false,
};
export class MockBillingRepo {
	public calledRedeemPromoCode = false;
	public isSuccessful = true;
	public redeemPromoCode(_value: PromoVOData): Promise<ClaimingPromoResponse> {
		this.calledRedeemPromoCode = true;
		if (this.isSuccessful) {
			return Promise.resolve(new ClaimingPromoResponse(mockPromoResponse));
		}
		return Promise.reject(new ClaimingPromoResponse(failedPromoResponse));
	}
}
export interface MockApiService {
	billing: MockBillingRepo;
}
export class MockAccountService {
	public addedStorage: number | undefined;
	public failRefresh: boolean = false;
	public addMoreSpaceAfterRefresh: boolean = false;
	public account: AccountVO = new AccountVO({
		spaceLeft: 1024,
		spaceTotal: 1024,
	});
	public refreshAccount(): Promise<void> {
		if (this.failRefresh) {
			return Promise.reject();
		}
		if (this.addMoreSpaceAfterRefresh) {
			this.account.spaceLeft += 5000 * 1024 * 1024;
			this.account.spaceTotal += 5000 * 1024 * 1024;
		}
		return Promise.resolve();
	}
	public getAccount(): AccountVO {
		return this.account;
	}
	public setAccount(_account: AccountVO): void {}
	public addStorageBytes(sizeInBytes: number): void {
		this.account.spaceLeft += sizeInBytes;
		this.account.spaceTotal += sizeInBytes;
		this.addedStorage = sizeInBytes;
	}
}
