/* @format*/
import { Injectable } from '@angular/core';
import mixpanel from 'mixpanel-browser';
import { SecretsService } from '../secrets/secrets.service';
import { environment } from '@root/environments/environment';
import { AccountVO } from '@models/account-vo';

@Injectable({
  providedIn: 'root',
})
export class MixpanelService {
  public static enableMixpanel = true;
  protected enabled = false;
  protected token: string;

  constructor(secrets: SecretsService) {
    if (secrets.get('MIXPANEL_TOKEN') && MixpanelService.enableMixpanel) {
      this.token = secrets.get('MIXPANEL_TOKEN');
      this.enabled = true;
      mixpanel.init(this.token, {
        debug: environment.analyticsDebug,
        persistence: 'localStorage',
        track_pageview: true,
      });
    }
  }

  public identify(account: AccountVO): void {
    if (this.enabled) {
      if (account.accountId) {
        const mixpanelIdentifier: string = environment.analyticsDebug
          ? `${environment.environment}:${account.accountId}`
          : `${account.accountId}`;
        mixpanel.identify(mixpanelIdentifier);
        mixpanel.people.set({
          accountId: `${account.accountId}`,
          environment: environment.environment,
        });
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}