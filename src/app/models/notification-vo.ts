import { BaseVOData } from './base-vo';
import { ArchiveVO } from './archive-vo';
import { FolderVO } from './folder-vo';
import { RecordVO } from './record-vo';

export type NotificationStatus =
  | 'status.notification.new'
  | 'status.notification.seen'
  | 'status.notification.read'
  | 'status.notification.emailed';

export type NotificationType =
  | 'type.notification.pa_response_non_transfer'
  | 'type.notification.cleanup_bad_upload'
  | 'type.notification.facebook_everything_retrieval_success'
  | 'type.notification.facebook_everything_retrieval_failure'
  | 'type.notification.facebook_everything_retrieval_out_of_space'
  | 'type.notification.facebook_permanent_retrieval_success'
  | 'type.notification.facebook_permanent_retrieval_failure'
  | 'type.notification.facebook_permanent_retrieval_out_of_space'
  | 'type.notification.pa_access_change'
  | 'type.notification.pa_response'
  | 'type.notification.pa_share'
  | 'type.notification.pa_transfer'
  | 'type.notification.relationship_accept'
  | 'type.notification.relationship_reject'
  | 'type.notification.relationship_request'
  | 'type.notification.share'
  | 'type.notification.zip';

export interface NotificationVOData extends BaseVOData {
  notificationId?: number;
  fromAccountId?: number;
  fromArchiveId?: number;
  toAccountId?: number;
  toArchiveId?: number;
  folder_linkId?: number;
  message?: string;
  redirectUrl?: string;
  thumbArchiveNbr?: string;
  timesSent?: number;
  lastSentDT?: string;
  emailKVP?: string;
  status?: NotificationStatus;
  type?: NotificationType;
}
