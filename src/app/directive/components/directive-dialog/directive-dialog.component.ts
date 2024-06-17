/* @format */
import { Component } from '@angular/core';
import { Directive } from '@models/directive';
import { AccountService } from '@shared/services/account/account.service';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';

export type DialogState = 'display' | 'edit';

@Component({
  selector: 'pr-directive-dialog',
  templateUrl: './directive-dialog.component.html',
  styleUrls: ['./directive-dialog.component.scss'],
})
export class DirectiveDialogComponent {
  constructor(
    private accountService: AccountService,
    private analytics: AnalyticsService,
  ) {
    const account = this.accountService.getAccount();
    this.analytics.notifyObservers({
      entity: 'account',
      action: 'open_archive_steward',
      version: 1,
      entityId: account.accountId.toString(),
      body: {
        analytics: {
          event: 'View Archive Steward',
          data: {
            page: 'Archive Steward',
          },
        },
      },
    });
  }
  public mode: DialogState = 'display';
  public directive: Directive;

  public setSavedDirective(directive: Directive): void {
    this.directive = directive;
  }

  public switchToEdit(directive: Directive): void {
    this.setSavedDirective(directive);
    this.mode = 'edit';
  }

  public saveEditedDirective(directive: Directive): void {
    this.setSavedDirective(directive);
    this.mode = 'display';
  }
}
