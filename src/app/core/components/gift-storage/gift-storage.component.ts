/* @format */
import { Dialog } from './../../../dialog/dialog.service';
import { AccountService } from './../../../shared/services/account/account.service';
import { Component, OnDestroy } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  ValidationErrors,
} from '@angular/forms';
import { AccountVO } from '@models/index';
import { Observable, BehaviorSubject, Subscription, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private sub: Subscription;

  constructor(
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private dialog: Dialog
  ) {
    this.account = this.accountService.getAccount();
    this.availableSpace = this.bytesToGigabytes(this.account?.spaceLeft);
    this.giftForm = this.fb.group({
      email: [
        '',
        {
          validators: [Validators.email],
          asyncValidators: this.emailValidator,
          updateOn: 'blur',
        },
      ],
      amount: [
        '',
        {
          validators: [
            Validators.required,
            Validators.min(0),
            Validators.max(Number(this.availableSpace)),
            this.integerValidator,
          ],
        },
      ],
      message: ['', []],
    });
    this.sub = this.giftResult.subscribe((isSuccessful) => {
      const giftedAmount = Number(this.giftForm.value.amount);
      const remainingSpaceAfterGift =
        Number(this.availableSpace) - giftedAmount;
      this.availableSpace = String(remainingSpaceAfterGift);

      const remainingSpaceInBytes =
        remainingSpaceAfterGift * this.bytesPerGigabyte;

      const newAccount = new AccountVO({
        ...this.account,
        spaceLeft: remainingSpaceInBytes,
        spaceTotal:
          this.account.spaceTotal - giftedAmount * this.bytesPerGigabyte,
      });

      this.accountService.setAccount(newAccount);
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
    this.isSuccessful = false;
  }

  bytesToGigabytes(bytes: number): string {
    return (bytes / this.bytesPerGigabyte).toFixed(2);
  }

  integerValidator(control: FormControl) {
    if (control.value === '') {
      return null;
    }

    const isInteger = Number.isInteger(Number(control.value));
    const hasDecimalPoint = control.value.toString().includes('.');

    return isInteger && !hasDecimalPoint ? null : { notInteger: true };
  }

  emailValidator: AsyncValidatorFn = (
    control: AbstractControl
  ): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return timer(1000).pipe(
      map(() => {
        let emailValidationResult = Validators.email(control);
        return emailValidationResult == null ? null : { email: true };
      })
    );
  };
}
