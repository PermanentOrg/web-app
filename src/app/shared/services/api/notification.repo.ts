import { BaseResponse, BaseRepo } from '@shared/services/api/base';

export class NotificationRepo extends BaseRepo {
  public getNotifications(): Promise<NotificationResponse> {
    return this.http.sendRequestPromise<NotificationResponse>('/notification/getMyNotifications', [{}], NotificationResponse);
  }
}

export class NotificationResponse extends BaseResponse {
  public getNotificationVOs() {
    const data = this.getResultsData();

    return data[0].map(result => result.NotificationVO);
  }
}
