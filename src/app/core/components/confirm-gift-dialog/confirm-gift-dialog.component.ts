/* @format */
import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
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
    private api: ApiService,
    @Inject(DIALOG_DATA) public data: any,
    private msg: MessageService
  ) {
    this.emails = this.data.emails;
    this.amount = this.data.amount;
    this.message = this.data.message;
    this.giftResult = this.data.giftResult;
  }

  public onDoneClick(): void {
    this.dialogRef.close();
  }

  public async onConfirmClick() {
    try {
      const res = await this.api.billing.giftStorage(
        this.emails,
        Number(this.amount),
        this.message
      );
      const response = {
        isSuccessful: true,
        response: res,
      };
      this.giftResult.next(response);
    } catch (e) {
      this.msg.showError('Something went wrong! Please try again.');
      this.giftResult.next({ isSuccessful: false, response: null });
    }
    this.dialogRef?.close();
  }
}
