/* @format */
import { BaseResponse, BaseRepo } from '@shared/services/api/base';
import { NotificationVOData } from '@models/notification-vo';

export class NotificationRepo extends BaseRepo {
  public getNotifications(): Promise<NotificationResponse> {
    return this.http.sendRequestPromise<NotificationResponse>(
      '/notification/getMyNotifications',
      [{}],
      { responseClass: NotificationResponse },
    );
  }

  public getNotificationsSince(
    lastNotification: NotificationVOData,
  ): Promise<NotificationResponse> {
    const data = {
      NotificationVO: lastNotification,
    };

    return this.http.sendRequestPromise<NotificationResponse>(
      '/notification/getMyNotificationsSince',
      [data],
      { responseClass: NotificationResponse },
    );
  }

  public update(notifications: NotificationVOData[]) {
    const data = notifications.map((n) => {
      return {
        NotificationVO: n,
      };
    });

    return this.http.sendRequestPromise<NotificationResponse>(
      '/notification/updateNotification',
      data,
      { responseClass: NotificationResponse },
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
