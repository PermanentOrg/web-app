/* @format */
import {
  LedgerNonfinancialVOData,
  LedgerFinancialVOData,
  AccountVO,
  PromoVOData,
} from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { BillingPaymentVO } from '@models';
import { getFirst } from '../http-v2/http-v2.service';

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
      { responseClass: BillingResponse },
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
      { responseClass: BillingResponse },
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
      { responseClass: BillingResponse },
    );
  }

  public redeemPromoCode(promo: PromoVOData) {
    const data = [
      {
        PromoVO: promo,
      },
    ];

    return this.http.sendRequestPromise<BillingResponse>('/promo/entry', data, {
      responseClass: BillingResponse,
    });
  }

  public giftStorage(
    recipientEmails: string[],
    storageAmount: number,
    note?: string,
  ): Promise<GiftingResponse> {
    const data = {
      recipientEmails,
      storageAmount,
      ...(note ? { note } : {}),
    };

    return getFirst(
      this.httpV2.post('v2/billing/gift', data, GiftingResponse),
    ).toPromise();
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

export class GiftingResponse {
  storageGifted: number;
  giftDelivered: string[];
  invitationSent: string[];
  alreadyInvited: string[];

  constructor(props: Object) {
    for (const prop in props) {
      this[prop] = props[prop];
    }
  }
}
