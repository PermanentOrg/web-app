import { Injectable } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { NotificationVOData } from '@models/notification-vo';
import { MessageService } from '@shared/services/message/message.service';
import { filter } from 'lodash';
import { Subscription } from 'rxjs';
import debug from 'debug';

const REFRESH_INTERVAL = 30 * 1000;
@Injectable()
export class NotificationService {
  notifications: NotificationVOData[];
  newNotificationCount: number;

  refreshIntervalId: NodeJS.Timeout;

  private debug = debug('service:notificationService');
  constructor(
    private api: ApiService,
    private message: MessageService,
    private account: AccountService
  ) {
    this.init();

    this.account.accountChange.subscribe(account => {
      this.init();
    });

    this.account.archiveChange.subscribe(account => {
      this.init();
    });
  }

  async init() {
    this.newNotificationCount = 0;
    this.notifications = [];

    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }

    if (this.account.isLoggedIn()) {
      this.loadLatestNotifications();
      this.refreshIntervalId = setInterval(() => {
        this.loadNewNotifications();
      }, REFRESH_INTERVAL);
    }
  }

  async loadLatestNotifications() {
    try {
      const response = await this.api.notification.getNotifications();
      this.notifications = response.getNotificationVOs();
      this.setUnreadCount();
      this.debug('got full list %d items', this.notifications.length);
    } catch (err) {
      console.error(err);
      this.message.showError('There was an error fetching your notifications.', false);
    }
  }

  async loadNewNotifications() {
    try {
      if (this.notifications.length) {
        const response = await this.api.notification.getNotificationsSince(this.notifications[0]);
        const newNotifications = response.getNotificationVOs();
        this.debug('got new notifications %d', newNotifications.length);
        if (newNotifications.length) {
          this.notifications.unshift(...newNotifications.reverse());
        }
        this.setUnreadCount();
      } else {
        this.loadLatestNotifications();
      }
    } catch (err) {
      console.error(err);
      this.message.showError('There was an error fetching your notifications.', false);
    }
  }

  setUnreadCount() {
    this.newNotificationCount = filter(this.notifications, n => n.status === 'status.notification.new' || n.status === 'status.notification.emailed').length;
  }
}
