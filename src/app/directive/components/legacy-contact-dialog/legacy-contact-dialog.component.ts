/* @format */
import { Component } from '@angular/core';
import { LegacyContact } from '@models/directive';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';
import { DialogState } from '../directive-dialog/directive-dialog.component';

@Component({
  selector: 'pr-legacy-contact-dialog',
  templateUrl: './legacy-contact-dialog.component.html',
  styleUrls: ['./legacy-contact-dialog.component.scss'],
})
export class LegacyContactDialogComponent {
  constructor(
    private api: ApiService,
    private accountService: AccountService,
    private analytics: AnalyticsService
  ) {
    const account = this.accountService.getAccount();
    this.analytics.notifyObservers({
      entity: 'account',
      action: 'open_legacy_contact',
      version: 1,
      entityId: account?.accountId.toString(),
      body: {
        analytics: {
          event: 'View Legacy Contact',
          data: {
            page: 'Legacy Contact',
          },
        },
      },
    });
  }
  public mode: DialogState = 'display';
  public legacyContact: LegacyContact;

  public setLegacyContact(legacyContact: LegacyContact): void {
    this.legacyContact = Object.assign({}, legacyContact);
  }

  public saveEditedLegacyContact(legacyContact: LegacyContact): void {
    this.setLegacyContact(legacyContact);
    this.mode = 'display';
  }
}
