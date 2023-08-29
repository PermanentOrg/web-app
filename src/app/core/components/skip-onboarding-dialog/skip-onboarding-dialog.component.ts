import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { Component, Inject, OnInit } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '../../../shared/services/account/account.service';
import { ApiService } from '../../../shared/services/api/api.service';

@Component({
  selector: 'pr-skip-onboarding-dialog',
  templateUrl: './skip-onboarding-dialog.component.html',
  styleUrls: ['./skip-onboarding-dialog.component.scss'],
})
export class SkipOnboardingDialogComponent implements OnInit {
  TYPE = 'type.archive.person';
  name = '';

  constructor(
    private dialog: DialogRef,
    private account: AccountService,
  ) {}

  ngOnInit() {
    this.name = this.account.getAccount().fullName;
  }

  onDoneClick(): void {
    this.dialog.close();
  }

  async onConfirmClick() {
    this.dialog.close();
    const archive = new ArchiveVO({
      fullName: this.name,
      type: this.TYPE,
    });
    this.account.createAccountForMe.next(this.name);
  }
}
