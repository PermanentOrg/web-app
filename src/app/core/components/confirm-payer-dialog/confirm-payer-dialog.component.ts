import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'pr-confirm-payer-dialog',
  templateUrl: './confirm-payer-dialog.component.html',
  styleUrls: ['./confirm-payer-dialog.component.scss'],
})
export class ConfirmPayerDialogComponent {
  archiveId;
  isPayerDifferentThanLoggedUser: boolean;
  handleAccountInfoChange: (val: boolean) => void;
  cancelAccountPayerSet: () => void;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
  ) {
    this.archiveId = this.data.archiveId;
    this.isPayerDifferentThanLoggedUser =
      this.data.isPayerDifferentThanLoggedUser;
    this.handleAccountInfoChange = this.data.handleAccountInfoChange;
    this.cancelAccountPayerSet = this.data.cancelAccountPayerSet;
  }

  onDoneClick(): void {
    this.cancelAccountPayerSet();
    this.dialogRef.close();
  }

  onConfirmClick() {
    this.handleAccountInfoChange(!this.isPayerDifferentThanLoggedUser);
    this.dialogRef.close();
  }
}
