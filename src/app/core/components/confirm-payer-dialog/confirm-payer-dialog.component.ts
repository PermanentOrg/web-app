import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-confirm-payer-dialog',
  templateUrl: './confirm-payer-dialog.component.html',
  styleUrls: ['./confirm-payer-dialog.component.scss'],
})
export class ConfirmPayerDialogComponent {
  archiveId;
  isPayerDifferentThanLoggedUser: boolean;
  handleAccountInfoChange: any;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
  ) {
    this.archiveId = this.data.archiveId;
    this.isPayerDifferentThanLoggedUser =
      this.data.isPayerDifferentThanLoggedUser;
    this.handleAccountInfoChange = this.data.handleAccountInfoChange;
  }

  onDoneClick(): void {
    this.dialogRef.close();
  }

  onConfirmClick() {
    this.handleAccountInfoChange(!this.isPayerDifferentThanLoggedUser)
    this.dialogRef.close();
  }
}
