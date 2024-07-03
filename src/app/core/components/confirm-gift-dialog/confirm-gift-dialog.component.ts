/* @format */
import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { BehaviorSubject } from 'rxjs';
import { GiftingResponse } from '@shared/services/api/billing.repo';

@Component({
  selector: 'pr-confirm-gift-dialog',
  templateUrl: './confirm-gift-dialog.component.html',
  styleUrls: ['./confirm-gift-dialog.component.scss'],
})
export class ConfirmGiftDialogComponent {
  emails: string[];
  amount: number;
  message: string;
  giftResult: BehaviorSubject<{
    isSuccessful: boolean;
    response: GiftingResponse | null;
  }>;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
  ) {}

  public onDoneClick(): void {
    this.dialogRef.close();
  }

  public async onConfirmClick() {
    this.dialogRef.close(true);
  }
}
