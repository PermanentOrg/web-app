type EventEntity =
  | 'account'
  | 'legacy_contact'
  | 'directive'
  | 'record'
  | 'profile_item';

type EventAction =
  | 'create'
  | 'login'
  | 'start_onboarding'
  | 'submit_goals'
  | 'submit_reasons'
  | 'open_account_menu'
  | 'open_archive_menu'
  | 'initiate_upload'
  | 'submit'
  | 'open_archive_profile'
  | 'update'
  | 'open_storage_modal'
  | 'purchase_storage'
  | 'open_promo_entry'
  | 'submit_promo'
  | 'skip_create_archive'
  | 'skip_goals'
  | 'skip_why_permanent'
  | 'open_login_info'
  | 'open_verify_email'
  | 'open_billing_info'
  | 'open_legacy_contact'
  | 'open_archive_steward'
  | 'publish'
  | 'move'
  | 'copy';

export interface EventData {
  entity: EventEntity;
  action: EventAction;
  version: number;
  entityId: string;
  userAgent?: string;
  body: {
    analytics?: {
      event: string;
      distinctId?: string;
      data: Record<string, unknown>;
    };
    [key: string]: unknown;
  };
}
