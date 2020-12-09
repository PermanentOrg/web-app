export enum PhaseChargeStatus {
  AUTH_SUCCESSFUL = 'auth_successful',
  PAYMENT_DECLINED = 'payment_declined',
  PAYMENT_EXPIRED = 'payment_expired',
  CHARGE_COMPLETE = 'payment_complete'
}

export enum PhaseContactStatus {
  INITIAL_CONTACT = 'initial_contact',
  BAD_PAYMENT = 'bad_payment',
  UPDATE_NUDGE = 'update_nudge',
  PAYMENT_RECEIPT = 'payment_receipt',
  PLEDGE_CANCELLED = 'pledge_cancelled'
}

export interface PhaseUserStatus {
  pledgeTotal?: number;
  chargeStatus?: PhaseChargeStatus,
  contactStatus?: PhaseContactStatus
}

export interface UserData {
  email?: string;
  name?: string;
  stripeCustomerId?: string;
  stripeIntentId?: string;
  phase1?: PhaseUserStatus;
  phase2?: PhaseUserStatus;
}