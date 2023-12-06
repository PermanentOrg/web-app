/* @format */
import { Component, OnInit, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.module';
import { AccountService } from '@shared/services/account/account.service';
import { AccountResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

export type SettingsTab =
  | 'storage'
  | 'account'
  | 'notification'
  | 'billing'
  | 'legacy-contact'
  | 'delete'
  | 'advanced-settings';

@Component({
  selector: 'pr-account-settings-dialog',
  templateUrl: './account-settings-dialog.component.html',
  styleUrls: ['./account-settings-dialog.component.scss'],
})
export class AccountSettingsDialogComponent implements OnInit {
  public activeTab: SettingsTab = 'account';

  public readonly verifyText = 'DELETE';
  public deleteVerify: string = null;
  public waiting = false;

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
    public accountService: AccountService,
    private message: MessageService,
    private api: ApiService,
    public route: ActivatedRoute
  ) {
    if (data.tab) {
      this.activeTab = data.tab;
    }
  }

  ngOnInit(): void {}

  onDoneClick() {
    this.dialogRef.close();
  }

  setTab(tab: SettingsTab) {
    this.activeTab = tab;
  }

  async onDeleteAccountConfirm() {
    if (this.deleteVerify !== this.verifyText) {
      return;
    }

    this.waiting = true;

    try {
      await this.api.account.delete(this.accountService.getAccount());
      await this.accountService.logOut();
      window.location.assign('/');
    } catch (err) {
      if (err instanceof AccountResponse) {
        this.message.showError(err.getMessage(), true);
      } else {
        this.message.showError(
          'There was an error deleting the account.',
          false
        );
      }
    } finally {
      this.waiting = false;
    }
  }
}
