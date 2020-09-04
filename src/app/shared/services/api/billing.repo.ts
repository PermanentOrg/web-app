import { ArchiveVO, LedgerNonfinancialVOData, AccountVO, PromoVOData } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { BillingCardVO, BillingPaymentVO } from '@models';

export class BillingRepo extends BaseRepo {
  public getCards(): Promise<BillingResponse> {
   return this.http.sendRequestPromise('/billing/getBillingCards', [], BillingResponse);
  }

  public addCard(billingCardVO: BillingCardVO): Promise<BillingResponse> {
    const data = [{
      BillingCardVO: billingCardVO
    }];

    return this.http.sendRequestPromise<BillingResponse>('/billing/addCard', data, BillingResponse);
  }

  public processPayment(billingCardVO: BillingCardVO, billingPaymentVO: BillingPaymentVO) {
    const data = [{
      BillingCardVO: billingCardVO,
      BillingPaymentVO: billingPaymentVO
    }];

    return this.http.sendRequestPromise<BillingResponse>('/billing/processPayment', data, BillingResponse);
  }

  public claimPledge(billingPaymentVO: BillingPaymentVO, pledgeId: string) {
    const data = [{
      BillingPaymentVO: billingPaymentVO,
      SimpleVO: {
        key: 'pledgeId',
        value: pledgeId
      }
    }];

    return this.http.sendRequestPromise<BillingResponse>('/billing/claimPledge', data, BillingResponse);
  }

  public getFileHistory(account: AccountVO) {
    const data = [{
      LedgerNonfinancialVO: {
        fromAccountId: account.accountId
      }
    }];
    return this.http.sendRequestPromise<BillingResponse>('/billing/getBillingLedgerNonfinancial', data, BillingResponse);
  }

  public redeemPromoCode(promo: PromoVOData) {
    const data = [{
      PromoVO: promo
    }];

    return this.http.sendRequestPromise<BillingResponse>('/promo/entry', data, BillingResponse);
  }
}

export class BillingResponse extends BaseResponse {
  getBillingCardVOs(): BillingCardVO[] {
    const data = this.getResultsData();
    if (!data || !data[0]) {
      return [];
    }

    return data[0].map(result => {
      return new BillingCardVO(result.BillingCardVO);
    });
  }

  getBillingCardVO(): BillingCardVO {
    const cards = this.getBillingCardVOs();

    if (cards && cards.length) {
      return cards[0];
    } else {
      return null;
    }
  }

  getLedgerNonfinancialVOs(): LedgerNonfinancialVOData[] {
    const data = this.getResultsData();
    if (!data || !data[0]) {
      return [];
    }

    return data[0].map(result => result.LedgerNonfinancialVO);
  }

  public getPromoVO() {
    const data = this.getResultsData();
    if (!data || !data.length) {
      return null;
    }

    return data[0][0].PromoVO as PromoVOData;
  }
}
