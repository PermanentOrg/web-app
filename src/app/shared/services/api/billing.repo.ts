/* @format */
import {
  LedgerNonfinancialVOData,
  LedgerFinancialVOData,
  AccountVO,
  PromoVOData,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { BillingPaymentVO } from '@models';

export class BillingRepo extends BaseRepo {
  public claimPledge(billingPaymentVO: BillingPaymentVO, pledgeId: string) {
    const data = [
      {
        BillingPaymentVO: billingPaymentVO,
        SimpleVO: {
          key: 'pledgeId',
          value: pledgeId,
        },
      },
    ];

    return this.http.sendRequestPromise<BillingResponse>(
      '/billing/claimPledge',
      data,
      BillingResponse
    );
  }

  public getFileHistory(account: AccountVO) {
    const data = [
      {
        LedgerNonfinancialVO: {
          fromAccountId: account.accountId,
        },
      },
    ];
    return this.http.sendRequestPromise<BillingResponse>(
      '/billing/getBillingLedgerNonfinancial',
      data,
      BillingResponse
    );
  }

  public getTransactionHistory(account: AccountVO) {
    const data = [
      {
        LedgerFinancialVO: {
          fromAccountId: account.accountId,
        },
      },
    ];
    return this.http.sendRequestPromise<BillingResponse>(
      '/billing/getBillingLedgerFinancial',
      data,
      BillingResponse
    );
  }

  public redeemPromoCode(promo: PromoVOData) {
    const data = [
      {
        PromoVO: promo,
      },
    ];

    return this.http.sendRequestPromise<BillingResponse>(
      '/promo/entry',
      data,
      BillingResponse
    );
  }

  public giftStorage(recipientEmail, storageAmount) {
    const data = {
      recipientEmail,
      storageAmount,
    };

    return this.httpV2.post('/billing/giftStorage', data).toPromise();
  }
}

export class BillingResponse extends BaseResponse {
  getLedgerNonfinancialVOs(): LedgerNonfinancialVOData[] {
    const data = this.getResultsData();
    if (!data || !data[0]) {
      return [];
    }

    return data[0].map((result) => result.LedgerNonfinancialVO);
  }

  getLedgerFinancialVOs(): LedgerFinancialVOData[] {
    const data = this.getResultsData();
    if (!data || !data[0]) {
      return [];
    }

    return data[0].map((result) => result.LedgerFinancialVO);
  }

  public getPromoVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return data[0][0].PromoVO as PromoVOData;
  }
}
