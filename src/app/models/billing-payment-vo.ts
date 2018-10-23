import { BaseVO } from '@models/base-vo';

export class BillingPaymentVO extends BaseVO {
  public accountIdThatPaid: number;
  public currency = 'USD';
  public donationAmount: number;
  public donationMatchAmount: number;
  public monetaryAmount: string;
  public receiptEmail: true;
  public refIdToIncrease: number;
  public refTableToIncrease: 'account';
  public spaceAmountInGb: number;
  public storageAmount: number;

  constructor(voData: BillingPaymentVOData) {
    super(voData);
  }
}

export interface BillingPaymentVOData {
  currency?: string;
  accountIdThatPaid?: number;
  donationAmount?: number;
  donationMatchAmount?: number;
  monetaryAmount?: string;
  receiptEmail?: true;
  refIdToIncrease?: number;
  refTableToIncrease?: string;
  spaceAmountInGb?: number;
  storageAmount?: number;
}
