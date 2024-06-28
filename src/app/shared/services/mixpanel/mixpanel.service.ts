/* @format*/
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@root/environments/environment';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { AnalyticsObserver } from '../analytics/analytics.service';

type MixpanelEntity =
  | 'account'
  | 'legacy_contact'
  | 'directive'
  | 'record'
  | 'profile_item';

export type MixpanelAction =
  | 'create'
  | 'login'
  | 'start_onboarding'
  | 'submit_goals'
  | 'submit_reasons'
  | 'open_account_menu'
  | 'open_archive_menu'
  | 'initiate_upload'
  | 'submit'
  | 'open_archive_profile'
  | 'update'
  | 'open_storage_modal'
  | 'purchase_storage'
  | 'open_promo_entry'
  | 'submit_promo'
  | 'skip_create_archive'
  | 'skip_goals'
  | 'skip_why_permanent'
  | 'open_login_info'
  | 'open_verify_email'
  | 'open_billing_info'
  | 'open_legacy_contact'
  | 'open_archive_steward';

export class MixpanelData {
  entity: MixpanelEntity;
  action: MixpanelAction;
  version: number;
  entityId: string;
  userAgent?: string;
  body: {
    analytics?: {
      event: string;
      distinctId?: string;
      data: Record<string, unknown>;
    };
    noTransmit?: boolean;
    [key: string]: unknown;
  };

  constructor(data: MixpanelData) {
    this.entity = data.entity;
    this.action = data.action;
    this.version = data.version;
    this.entityId = data.entityId;
    this.body = data.body;
  }
}

@Injectable({
  providedIn: 'root',
})
export class MixpanelService implements AnalyticsObserver {
  constructor(private httpV2: HttpV2Service) {}

  public async update(data: MixpanelData) {
    if (data.body.noTransmit) {
      return;
    }

    const account =
      localStorage.getItem('account') || sessionStorage.getItem('account');

    if (account) {
      const mixpanelIdentifier = environment.analyticsDebug
        ? `${environment.environment}:${JSON.parse(account).accountId}`
        : `${JSON.parse(account).accountId}`;

      if (data.body.analytics) {
        data.body.analytics.distinctId = mixpanelIdentifier;
      }

      await firstValueFrom(this.httpV2.post('/v2/event', data, null)).catch(
        () => {
          // Silently ignore an HTTP error, since we don't want calling code to
          // have to handle analytics errors.
        },
      );
    }
  }
}
