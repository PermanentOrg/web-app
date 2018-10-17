import { BaseVO } from '@models/base-vo';

export class BillingCardVO extends BaseVO {
  public CVC: string;
  public brand: string;
  public createdDT: string;
  public creditCardNbr: string;
  public expirationMonth: number;
  public expirationYear: number;
  public isDefault: boolean;
  public nickname: string;
  public updatedDT: string;
}
