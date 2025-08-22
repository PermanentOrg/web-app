import { BaseVO } from '@models/base-vo';

export class BillingPaymentVO extends BaseVO {
	public accountIdThatPaid: number;
	public currency = 'USD';
	public donationAmount: number;
	public donationMatchAmount: number;
	public monetaryAmount: string;
	public receiptEmail: true;
	public refIdToIncrease: number;
	public refTableToIncrease = 'account';
	public spaceAmountInGb: number;
	public storageAmount: number;

	constructor(voData: BillingPaymentVOData) {
		super(voData);
		this.accountIdThatPaid = voData.accountIdThatPaid;
		this.currency = voData.currency;
		this.donationAmount = voData.donationAmount;
		this.donationMatchAmount = voData.donationMatchAmount;
		this.monetaryAmount = voData.monetaryAmount;
		this.receiptEmail = voData.receiptEmail;
		this.refIdToIncrease = voData.refIdToIncrease;
		this.refTableToIncrease = voData.refTableToIncrease;
		this.spaceAmountInGb = voData.spaceAmountInGb;
		this.storageAmount = voData.storageAmount;
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
