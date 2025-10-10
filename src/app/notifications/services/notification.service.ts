import { Injectable, EventEmitter } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import {
	NotificationVOData,
	NotificationStatus,
} from '@models/notification-vo';
import { MessageService } from '@shared/services/message/message.service';
import { filter } from 'lodash';
import debug from 'debug';
import { Router } from '@angular/router';
import {
	MyArchivesDialogComponent,
	MyArchivesTab,
} from '@core/components/my-archives-dialog/my-archives-dialog.component';
import { ConnectionsTab } from '@core/components/connections-dialog/connections-dialog.component';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';

const REFRESH_INTERVAL = 30 * 1000;
@Injectable()
export class NotificationService {
	notifications: NotificationVOData[];
	newNotificationCount: number;

	refreshIntervalId: ReturnType<typeof setInterval>;

	notificationsChange = new EventEmitter<void>();
	waiting = false;

	private debug = debug('service:notificationService');
	constructor(
		private api: ApiService,
		private message: MessageService,
		private account: AccountService,
		private router: Router,
		private dialog: DialogCdkService,
	) {
		this.reset();

		this.account.accountChange.subscribe((account) => {
			this.reset();
		});

		this.account.archiveChange.subscribe((account) => {
			this.reset();
		});
	}

	async reset() {
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
		if (this.waiting) {
			return;
		}

		this.waiting = true;
		try {
			const response = await this.api.notification.getNotifications();
			this.notifications = response.getNotificationVOs();
			if (this.notifications) {
				this.notificationsChange.emit();
			}
			this.setNewNotificationCount();
			this.debug('got full list %d items', this.notifications.length);
		} catch (err) {
			this.message.showError({
				message: 'There was an error fetching your notifications.',
				translate: false,
			});
			throw err;
		} finally {
			this.waiting = false;
		}
	}

	async loadNewNotifications() {
		if (this.waiting) {
			return;
		}

		this.waiting = true;
		try {
			if (this.notifications.length) {
				const response = await this.api.notification.getNotificationsSince(
					this.notifications[0],
				);
				const newNotifications = response.getNotificationVOs();
				this.debug('got new notifications %d', newNotifications.length);
				if (newNotifications.length) {
					this.notifications.unshift(...newNotifications.reverse());
					this.notificationsChange.emit();
				}
				this.setNewNotificationCount();
			} else {
				this.loadLatestNotifications();
			}
		} catch (err) {
			this.message.showError({
				message: 'There was an error fetching your notifications.',
				translate: false,
			});
			throw err;
		} finally {
			this.waiting = false;
		}
	}

	setNewNotificationCount() {
		this.newNotificationCount = filter(
			this.notifications,
			(n) =>
				n.status === 'status.notification.new' ||
				n.status === 'status.notification.emailed',
		).length;
	}

	async setNotificationStatus(
		notifications: NotificationVOData[],
		status: NotificationStatus,
	) {
		const needsUpdate = notifications.filter((n) => n.status !== status);

		if (!needsUpdate.length) {
			return;
		}

		const originalValues = needsUpdate.map((n) => {
			const original = n.status;
			n.status = status;
			return original;
		});

		try {
			await this.api.notification.update(needsUpdate);
			this.setNewNotificationCount();
		} catch (err) {
			for (let i = 0; i < needsUpdate.length; i += 1) {
				const notification = needsUpdate[i];
				notification.status = originalValues[i];
			}
			this.message.showError({
				message: 'There was an error updating your notifications.',
				translate: false,
			});
			throw err;
		}
	}

	markAsSeen() {
		const notRead = this.notifications.filter(
			(n) => n.status !== 'status.notification.read',
		);
		this.setNotificationStatus(notRead, 'status.notification.seen');
	}

	markAll(status: NotificationStatus) {
		this.setNotificationStatus(this.notifications, status);
	}

	async goToNotification(notification: NotificationVOData) {
		this.setNotificationStatus([notification], 'status.notification.read');
		let path: any[];
		let queryParams: any;
		if (notification.type.includes('facebook')) {
			path = ['/app', 'apps'];
		} else if (notification.type.includes('relationship')) {
			if (notification.type === 'type.notification.relationship_request') {
				const tab: ConnectionsTab = 'pending';
				queryParams = {
					tab,
				};
			}
			path = ['/app', { outlets: { dialog: ['connections'] } }];
		} else if (notification.type === 'type.notification.share') {
			path = ['/app', 'shares'];
		} else if (notification.type === 'type.notification.zip') {
			const link = document.createElement('a');
			link.href = notification.redirectUrl;
			link.click();
		} else if (notification.type.includes('type.notification.pa_')) {
			await this.account.refreshArchives();
			let data: any;
			if (
				notification.type === 'type.notification.pa_transfer' ||
				notification.type === 'type.notification.pa_share'
			) {
				const activeTab: MyArchivesTab = 'pending';
				data = {
					activeTab,
				};
			}
			try {
				this.dialog.open(MyArchivesDialogComponent, {
					data,
					width: '1000px',
				});
			} catch (err) {}
		}

		if (path) {
			return await this.router.navigate(path, { queryParams });
		}
	}
}
