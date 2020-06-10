import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { GoogleAnalyticsService } from '@shared/services/google-analytics/google-analytics.service';
import { EVENTS } from '@shared/services/google-analytics/events';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models';

@Component({
  selector: 'pr-beta-toggle',
  templateUrl: './beta-toggle.component.html',
  styleUrls: ['./beta-toggle.component.scss']
})
export class BetaToggleComponent implements OnInit {
  public hasCookie: boolean;

  constructor(
    private cookie: CookieService,
    private account: AccountService,
    private ga: GoogleAnalyticsService
  ) {
    this.hasCookie = this.cookie.check('permBeta');
  }

  ngOnInit(): void {
    if (this.hasCookie && !this.account.getAccount()?.betaParticipant) {
      this.account.updateAccount(new AccountVO({betaParticipant: 1}));
    }
  }

  onClick() {
    this.ga.sendEvent(EVENTS.BETA.optOut);
    this.cookie.delete('permBeta', '/', `.${window.location.hostname}`);
    setTimeout(() => {
      window.location.assign(`https://${window.location.host}/app`);
    });
  }
}
