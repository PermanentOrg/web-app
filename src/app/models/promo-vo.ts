import { BaseVOData } from '@models/base-vo';

export interface PromoVOData extends BaseVOData {
  promoId?: number;
  code?: string;
  sizeInMB?: number;
  expiresDT?: string;
  remainingUses?: number;
  status?: string;
  type?: string;
}
