import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { NotificationVOData } from '@models/notification-vo';

export class NotificationRepo extends BaseRepo {
	public async getNotifications(): Promise<NotificationResponse> {
		return await this.http.sendRequestPromise<NotificationResponse>(
			'/notification/getMyNotifications',
			[{}],
			{ ResponseClass: NotificationResponse },
		);
	}

	public async getNotificationsSince(
		lastNotification: NotificationVOData,
	): Promise<NotificationResponse> {
		const data = {
			NotificationVO: lastNotification,
		};

		return await this.http.sendRequestPromise<NotificationResponse>(
			'/notification/getMyNotificationsSince',
			[data],
			{ ResponseClass: NotificationResponse },
		);
	}

	public async update(notifications: NotificationVOData[]) {
		const data = notifications.map((n) => ({
			NotificationVO: n,
		}));

		return await this.http.sendRequestPromise<NotificationResponse>(
			'/notification/updateNotification',
			data,
			{ ResponseClass: NotificationResponse },
		);
	}
}

export class NotificationResponse extends BaseResponse {
	public getNotificationVOs(): NotificationVOData[] {
		const data = this.getResultsData();

		if (!data.length) {
			return [];
		}

		return data[0].map((result) => result.NotificationVO);
	}
}
