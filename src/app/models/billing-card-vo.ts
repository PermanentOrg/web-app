import { BaseVO } from '@models/base-vo';

export class BillingCardVO extends BaseVO {
  public nickname: string;
  public creditCardNbr: string;
  public CVC: string;
  public expirationMonth: number;
  public expirationYear: number;
  public brand: string;
  public createdDT: string;
  public isDefault: boolean;
  public updatedDT: string;
}
