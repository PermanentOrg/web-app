/* @format */
import { AccountVO } from '@models/account-vo';
import { Directive, FolderVO, LegacyContact, RecordVO } from '@models/index';
import { ProfileItemVOData } from '@models/profile-item-vo';

export type AccountEventAction =
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
  | 'open_archive_steward';

export type LegacyContactAction = 'create' | 'update';

export type DirectiveAction = LegacyContactAction;

export type RecordAction = 'move' | 'copy' | 'publish' | 'submit';

export type FolderAction = RecordAction;

export type ProfileItemAction = 'update';

export interface AccountEvent {
  entity: 'account';
  action: AccountEventAction;
  account?: AccountVO;
}

export interface LegacyContactEvent {
  entity: 'legacy_contact';
  action: LegacyContactAction;
  legacyContact: LegacyContact;
}

export interface DirectiveEvent {
  entity: 'directive';
  action: DirectiveAction;
  directive: Directive;
}

export interface RecordEvent {
  entity: 'record';
  action: RecordAction;
  record?: RecordVO;
}

export interface FolderEvent {
  entity: 'folder';
  action: FolderAction;
  folder?: FolderVO;
}

export interface ProfileItemEvent {
  entity: 'profile_item';
  action: ProfileItemAction;
  profileItem: ProfileItemVOData;
}

export type PermanentEvent =
  | AccountEvent
  | LegacyContactEvent
  | DirectiveEvent
  | RecordEvent
  | FolderEvent
  | ProfileItemEvent;
