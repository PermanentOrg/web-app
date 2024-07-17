/* @format*/
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@root/environments/environment';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { EventObserver } from '../event/event.service';
import { PermanentEvent } from '../event/event-types';
import { DeviceService } from '../device/device.service';
import { DataService } from '../data/data.service';
import { AccountService } from '../account/account.service';
import { AnalyticsBodies } from './analytics-bodies';

export interface EventRequestBody {
  entity: PermanentEvent['entity'];
  action: PermanentEvent['action'];
  version: number;
  entityId: string;
  body: {
    analytics?: {
      event: string;
      distinctId?: string;
      data: Record<string, unknown>;
    };
    [key: string]: unknown;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService implements EventObserver {
  constructor(
    private httpV2: HttpV2Service,
    private device: DeviceService,
    private data: DataService,
    private account: AccountService,
  ) {}

  public async update(event: PermanentEvent) {
    const mixpanelEvent: EventRequestBody = this.getEventTemplate(event);

    if (typeof mixpanelEvent.body.analytics === 'undefined') {
      // Event does not have Mixpanel data; do not send to event endpoint
      return;
    }

    this.assignEntityId(mixpanelEvent, event);
    this.assignDistinctId(mixpanelEvent);

    await firstValueFrom(
      this.httpV2.post('/v2/event', mixpanelEvent, null),
    ).catch(() => {
      // Silently ignore an HTTP error, since we don't want calling code to
      // have to handle analytics errors.
    });
  }

  private getEventTemplate(event: PermanentEvent): EventRequestBody {
    return {
      entity: event.entity,
      action: event.action,
      version: 1,
      entityId: null,
      body: {
        analytics: this.getAnalyticsBody(event),
      },
    };
  }

  private getAnalyticsBody(
    event: PermanentEvent,
  ): EventRequestBody['body']['analytics'] | undefined {
    if (AnalyticsBodies[event.entity]) {
      if (AnalyticsBodies[event.entity][event.action]) {
        const analytics = { ...AnalyticsBodies[event.entity][event.action] };
        this.setDeviceSpecificAnalyticsEvent(analytics);
        this.setWorkspaceSpecificAnalyticsData(analytics);
        return analytics;
      }
    }
    return undefined;
  }

  private setWorkspaceSpecificAnalyticsData(analytics: {
    event: string;
    data: Record<string, unknown>;
  }) {
    if (analytics.data.workspace) {
      analytics.data.workspace = this.data.currentFolder.type.includes(
        'private',
      )
        ? 'Private Files'
        : 'Public Files';
    }
  }

  private setDeviceSpecificAnalyticsEvent(analytics: {
    event: string;
    data: Record<string, unknown>;
  }) {
    if (analytics.event === 'Page View') {
      if (this.device.isMobileWidth()) {
        analytics.event = 'Screen View';
      }
    }
  }

  private assignEntityId(
    mixpanelEvent: EventRequestBody,
    event: PermanentEvent,
  ) {
    switch (event.entity) {
      case 'account':
        if (event.account) {
          mixpanelEvent.entityId = `${event.account.accountId}`;
        } else {
          mixpanelEvent.entityId = `${this.account.getAccount()?.accountId}`;
        }
        break;
      case 'directive':
        mixpanelEvent.entityId = event.directive.directiveId;
        break;
      case 'legacy_contact':
        mixpanelEvent.entityId = event.legacyContact.legacyContactId;
        break;
      case 'profile_item':
        mixpanelEvent.entityId = `${event.profileItem.profile_itemId}`;
        break;
      case 'record':
        mixpanelEvent.entityId = `${event.record.recordId}`;
        break;
    }
  }

  private assignDistinctId(mixpanelEvent: EventRequestBody) {
    const account = this.account.getAccount();
    if (account) {
      const mixpanelIdentifier = environment.analyticsDebug
        ? `${environment.environment}:${account.accountId}`
        : `${account.accountId}`;
      mixpanelEvent.body.analytics.distinctId = mixpanelIdentifier;
    }
  }
}
