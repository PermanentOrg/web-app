import { ArchiveVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { BillingCardVO } from '@models/billing-card-vo';

export class BillingRepo extends BaseRepo {
  public getCards(): Promise<BillingResponse> {
   return this.http.sendRequestPromise('/billing/getBillingCards', [], BillingResponse);
  }

  public addCard(billingCardVO: BillingCardVO): Promise<BillingResponse> {
    const data = [{
      BillingCardVO: billingCardVO
    }];

    return this.http.sendRequestPromise('/billing/addCard', data, BillingResponse);
  }
}

export class BillingResponse extends BaseResponse {
  getBillingCardVOs(): BillingCardVO[] {
    const data = this.getResultsData();

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
}
