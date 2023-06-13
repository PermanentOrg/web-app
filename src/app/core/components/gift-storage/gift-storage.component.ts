import { FormControl } from '@angular/forms';
/* @format */
import { Dialog } from './../../../dialog/dialog.service';
import { AccountService } from './../../../shared/services/account/account.service';
import { Component, OnDestroy } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { AccountVO } from '@models/index';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'pr-gift-storage',
  templateUrl: './gift-storage.component.html',
  styleUrls: ['./gift-storage.component.scss'],
})
export class GiftStorageComponent implements OnDestroy {
  giftForm: UntypedFormGroup;
  availableSpace: string;
  account: AccountVO;
  bytesPerGigabyte = 1073741824;

  public isSuccessful: boolean = false;
  public giftResult: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private sub:Subscription;

  constructor(
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private dialog: Dialog
  ) {
    this.account = this.accountService.getAccount();
    this.availableSpace = this.bytesToGigabytes(this.account?.spaceLeft);
    this.giftForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      amount: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.max(Number(this.availableSpace)),
          this.integerValidator,
        ],
      ],
      message: ['', []],
    });
    this.sub = this.giftResult.subscribe((isSuccessful) => {
      this.isSuccessful = isSuccessful;
    });
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  submitStorageGiftForm(value: {
    email: string;
    amount: number;
    message: string;
  }) {
    this.dialog.open(
      'ConfirmGiftDialogComponent',
      {
        ...value,
        giftResult: this.giftResult,
      },
      {
        width: '700px',
      }
    );
  }

  closeSuccessMessage() {
    const remainingSpaceAfterGift =
      Number(this.availableSpace) - Number(this.giftForm.value.amount);
    this.availableSpace = this.bytesToGigabytes(
      remainingSpaceAfterGift * this.bytesPerGigabyte
    );
    this.isSuccessful = false;
  }

  bytesToGigabytes(bytes: number): string {
    return (bytes / this.bytesPerGigabyte).toFixed(2);
  }

  integerValidator(control: FormControl) {
    const isInteger = Number.isInteger(Number(control.value));
    const hasDecimalPoint = control.value.toString().includes('.');
  
    return isInteger && !hasDecimalPoint ? null : { notInteger: true };
  }
}
