import { Injectable } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { NotificationVOData } from '@models/notification-vo';
import { MessageService } from '@shared/services/message/message.service';
import { filter } from 'lodash';

@Injectable()
export class NotificationService {
  notifications: NotificationVOData[];
  newNotificationCount: number;

  constructor(
    private api: ApiService,
    private message: MessageService
  ) {
    this.loadLatestNotifications();
  }

  async loadLatestNotifications() {
    try {
      const response = await this.api.notification.getNotifications();
      this.notifications = response.getNotificationVOs();
      this.setUnreadCount();
    } catch (err) {
      this.message.showError('There was an error fetching your notifications.', false);
    }
  }

  async loadNewNotifications() {

  }

  setUnreadCount() {
    this.newNotificationCount = filter(this.notifications, n => n.status === 'status.notification.new' || n.status === 'status.notification.emailed').length;
  }
}
