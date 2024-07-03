/* @format */
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../shared/services/account/account.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'pr-skip-onboarding-dialog',
  templateUrl: './skip-onboarding-dialog.component.html',
  styleUrls: ['./skip-onboarding-dialog.component.scss'],
})
export class SkipOnboardingDialogComponent implements OnInit {
  TYPE = 'type.archive.person';
  CONFIRM = 'confirm';
  CANCEL = 'cancel';
  name = '';

  constructor(
    private dialog: DialogRef,
    private account: AccountService,
  ) {}

  ngOnInit() {
    this.name = this.account.getAccount().fullName;
  }

  onDoneClick(): void {
    this.dialog.close({
      name: '',
      action: this.CANCEL,
    });
  }

  async onConfirmClick() {
    this.dialog.close({
      name: this.name,
      action: this.CONFIRM,
    });
  }
}
