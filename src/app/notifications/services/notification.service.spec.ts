import {
  TestBed,
  fakeAsync,
  flushMicrotasks,
  discardPeriodicTasks,
} from '@angular/core/testing';

import { SharedModule } from '@shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MessageService } from '@shared/services/message/message.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { NotificationResponse } from '@shared/services/api/index.repo';
import { NotificationVOData } from '@models/notification-vo';
import { cloneDeep } from 'lodash';
import { NotificationService } from './notification.service';

const allNotificationsData: NotificationVOData[] = [
  {
    notificationId: 1,
    type: 'type.notification.cleanup_bad_upload',
    status: 'status.notification.seen',
  },
  {
    notificationId: 2,
    type: 'type.notification.pa_response',
    status: 'status.notification.new',
  },
  {
    notificationId: 3,
    type: 'type.notification.relationship_request',
    status: 'status.notification.emailed',
  },
];

const newNotificationData: NotificationVOData[] = [
  {
    notificationId: 4,
    type: 'type.notification.pa_response',
    status: 'status.notification.new',
  },
];

describe('NotificationService', () => {
  let accountService: AccountService;
  let apiService: ApiService;

  let service: NotificationService;
  let loggedInSpy: jasmine.Spy;
  let getNotificationsSpy: jasmine.Spy;
  let getNotificationsSinceSpy: jasmine.Spy;
  let updateSpy: jasmine.Spy;

  let allNotificationsResponse: NotificationResponse;
  let newNotificationsResponse: NotificationResponse;

  beforeEach(() => {
    loggedInSpy = null;
    getNotificationsSinceSpy = null;
    getNotificationsSpy = null;
    updateSpy = null;

    allNotificationsResponse = new NotificationResponse();
    allNotificationsResponse.setData(
      allNotificationsData.map((n) => {
        return { NotificationVO: cloneDeep(n) };
      }),
    );
    allNotificationsResponse.isSuccessful = true;

    newNotificationsResponse = new NotificationResponse();
    newNotificationsResponse.setData(
      newNotificationData.map((n) => {
        return { NotificationVO: cloneDeep(n) };
      }),
    );
    newNotificationsResponse.isSuccessful = true;

    TestBed.configureTestingModule({
    imports: [SharedModule, RouterTestingModule],
    providers: [NotificationService, MessageService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    accountService = TestBed.inject(AccountService);
    apiService = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    loggedInSpy = spyOn(accountService, 'isLoggedIn').and.returnValue(false);

    service = TestBed.inject(NotificationService);

    expect(service).toBeTruthy();
  });

  it('should not attempt to load notifications if not logged in', () => {
    loggedInSpy = spyOn(accountService, 'isLoggedIn').and.returnValue(false);
    getNotificationsSpy = spyOn(apiService.notification, 'getNotifications');

    service = TestBed.inject(NotificationService);

    expect(service.notifications).toBeDefined();
    expect(service.notifications.length).toBe(0);
    expect(getNotificationsSpy).not.toHaveBeenCalled();
  });

  it('should load notifications if logged in and set unread count', fakeAsync(() => {
    loggedInSpy = spyOn(accountService, 'isLoggedIn').and.returnValue(true);

    getNotificationsSpy = spyOn(
      apiService.notification,
      'getNotifications',
    ).and.returnValue(Promise.resolve(allNotificationsResponse));

    service = TestBed.inject(NotificationService);

    expect(getNotificationsSpy).toHaveBeenCalledTimes(1);
    expect(service.refreshIntervalId).toBeDefined();
    flushMicrotasks();

    expect(service.notifications.length).toBe(allNotificationsData.length);
    expect(service.newNotificationCount).toBe(2);

    discardPeriodicTasks();
  }));

  it('should load new notifications and update the unread count', fakeAsync(() => {
    loggedInSpy = spyOn(accountService, 'isLoggedIn').and.returnValue(true);

    getNotificationsSpy = spyOn(
      apiService.notification,
      'getNotifications',
    ).and.returnValue(Promise.resolve(allNotificationsResponse));

    getNotificationsSinceSpy = spyOn(
      apiService.notification,
      'getNotificationsSince',
    ).and.returnValue(Promise.resolve(newNotificationsResponse));

    service = TestBed.inject(NotificationService);

    flushMicrotasks();

    expect(service.newNotificationCount).toBeGreaterThan(0);
    const countBeforeNew = service.newNotificationCount;

    service.loadNewNotifications();
    flushMicrotasks();

    expect(getNotificationsSinceSpy).toHaveBeenCalledTimes(1);
    expect(service.newNotificationCount).toBeGreaterThan(countBeforeNew);
    expect(service.notifications.length).toBe(
      allNotificationsData.length + newNotificationData.length,
    );

    expect(service.notifications[0]).toEqual(newNotificationData[0]);
    discardPeriodicTasks();
  }));

  it('should mark notifications as seen and update the unread count', fakeAsync(() => {
    let countBeforeMarkSeen: number;

    loggedInSpy = spyOn(accountService, 'isLoggedIn').and.returnValue(true);

    getNotificationsSpy = spyOn(
      apiService.notification,
      'getNotifications',
    ).and.returnValue(Promise.resolve(allNotificationsResponse));

    updateSpy = spyOn(apiService.notification, 'update').and.callFake(
      (notifications) => {
        expect(notifications.length).toBe(countBeforeMarkSeen);
        const response = new NotificationResponse();
        response.isSuccessful = true;
        return Promise.resolve(response);
      },
    );

    service = TestBed.inject(NotificationService);

    flushMicrotasks();

    expect(service.newNotificationCount).toBeGreaterThan(0);
    countBeforeMarkSeen = service.newNotificationCount;

    service.markAsSeen();

    flushMicrotasks();

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(service.newNotificationCount).toBe(0);

    discardPeriodicTasks();
  }));

  it('should mark notifications as read and update the unread count', fakeAsync(() => {
    let countBeforeMarkSeen: number;

    loggedInSpy = spyOn(accountService, 'isLoggedIn').and.returnValue(true);

    getNotificationsSpy = spyOn(
      apiService.notification,
      'getNotifications',
    ).and.returnValue(Promise.resolve(allNotificationsResponse));

    updateSpy = spyOn(apiService.notification, 'update').and.callFake(
      (notifications) => {
        expect(notifications.length).toBe(allNotificationsData.length);
        const response = new NotificationResponse();
        response.isSuccessful = true;
        return Promise.resolve(response);
      },
    );

    service = TestBed.inject(NotificationService);

    flushMicrotasks();

    expect(service.newNotificationCount).toBeGreaterThan(0);
    countBeforeMarkSeen = service.newNotificationCount;

    service.markAll('status.notification.read');

    flushMicrotasks();

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(service.newNotificationCount).toBe(0);

    discardPeriodicTasks();
  }));
});
