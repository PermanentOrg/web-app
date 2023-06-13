import { BehaviorSubject } from 'rxjs';
/* @format */
import { Observable, Subscription } from 'rxjs';
import { Component, Inject, OnDestroy } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-confirm-gift-dialog',
  templateUrl: './confirm-gift-dialog.component.html',
  styleUrls: ['./confirm-gift-dialog.component.scss'],
})
export class ConfirmGiftDialogComponent {
  email: string;
  amount: number;
  message: string;
  giftResult: BehaviorSubject<boolean>;

  constructor(
    private dialogRef: DialogRef,
    private api: ApiService,
    @Inject(DIALOG_DATA) public data: any,
    private msg: MessageService
  ) {
    this.email = this.data.email;
    this.amount = this.data.amount;
    this.message = this.data.message;
    this.giftResult = this.data.giftResult;
  }

  public onDoneClick(): void {
    this.dialogRef.close();
  }

  public async onConfirmClick() {
    try {
      await this.api.billing.giftStorage(
        this.email,
        Number(this.amount)
      );
      this.giftResult.next(true)
    } catch (e) {
      this.msg.showError('Something went wrong! Please try again.');
      this.giftResult.next(false)
    }
    this.dialogRef?.close();
  }
}
