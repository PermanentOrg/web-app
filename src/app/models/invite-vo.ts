import { BaseVO } from '@models/base-vo';

export class InviteVO extends BaseVO {
  public email: string;
  public fullName: string;
  public relationship: string;
  public type = 'type.invite.invite_early_access';

  constructor(voData: InviteVOData) {
    super(voData);
  }
}

export interface InviteVOData {
  email?: string;
  fullName?: string;
  relationship?: string;
  type?: string;
}
