import { AccountVO } from '@models/account-vo';
import { PromoVOData } from '@models/promo-vo';
import { BillingResponse } from '@shared/services/api/billing.repo';

const mockPromoResponse = {
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
  public redeemPromoCode(_value: PromoVOData): Promise<BillingResponse> {
    this.calledRedeemPromoCode = true;
    if (this.isSuccessful) {
      return Promise.resolve(new BillingResponse(mockPromoResponse));
    }
    return Promise.reject(new BillingResponse(failedPromoResponse));
  }
}
export interface MockApiService {
  billing: MockBillingRepo;
}
export class MockAccountService {
  public addedStorage: number | undefined;
  public failRefresh: boolean = false;
  public refreshAccount(): Promise<void> {
    if (this.failRefresh) {
      return Promise.reject();
    }
    return Promise.resolve();
  }
  public setAccount(_account: AccountVO): void {}
  public addStorageBytes(sizeInBytes: number): void {
    this.addedStorage = sizeInBytes;
  }
}
