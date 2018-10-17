import { ArchiveVO } from '@root/app/models';
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { BillingCardVO } from '@models/billing-card-vo';

export class BillingRepo extends BaseRepo {
  public getCards(): Promise<BillingResponse> {
   return this.http.sendRequestPromise('/billing/getBillingCards', [], BillingResponse);
  }
}

export class BillingResponse extends BaseResponse {
  getBillingCardVOs(): BillingCardVO[] {
    const data = this.getResultsData();

    return data[0].map(result => {
      return new BillingCardVO(result.BillingCardVO);
    });
  }
}
