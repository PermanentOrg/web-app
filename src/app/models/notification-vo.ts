import { BaseVOData } from './base-vo';

export type NotificationStatus =
  'status.notification.new' |
  'status.notification.seen' |
  'status.notification.read' |
  'status.notification.emailed'
  ;

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
  type?: string;
}
