/* @format */
import { Component, OnDestroy } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { AccountVO } from '@models/index';
import { unsubscribeAll } from '@shared/utilities/hasSubscriptions';
import { Observable, BehaviorSubject, Subscription, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Dialog } from '../../../dialog/dialog.service';
import { AccountService } from '../../../shared/services/account/account.service';

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
  emailValidationErrors: string[] = [];

  public isSuccessful: boolean = false;
  public giftResult: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private subscriptions: Subscription[] = [];
  public isAsyncValidating: boolean;

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
          validators: [Validators.required],
          asyncValidators: [this.delayedEmailValidator()],
          updateOn: 'change',
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
            this.giftedAmountValidator(),
          ],
          updateOn: 'change',
        },
      ],
      message: ['', []],
    });
    this.subscriptions.push(
      this.giftResult.subscribe((isSuccessful) => {
        if (isSuccessful) {
          console.log(this.giftForm.value.email);
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
        }
      })
    ),
      this.giftForm.get('email')?.valueChanges.subscribe(() => {
        this.giftForm.get('amount')?.updateValueAndValidity();
      });
  }

  ngOnDestroy(): void {
    unsubscribeAll(this.subscriptions);
  }

  submitStorageGiftForm(value: {
    email: string;
    amount: number;
    message: string;
  }) {
    const emails = this.parseEmailString(value.email);
    const fullAmount = Number(value.amount) * emails.length;
    this.dialog.open(
      'ConfirmGiftDialogComponent',
      {
        emails,
        fullAmount,
        message: value.message,
        giftResult: this.giftResult,
      },
      {
        width: '700px',
      }
    );
  }

  closeSuccessMessage() {
    this.giftForm.reset();
    this.isSuccessful = false;
  }

  bytesToGigabytes(bytes: number): string {
    return (bytes / this.bytesPerGigabyte).toFixed(2);
  }

  integerValidator(control: FormControl) {
    if (!control.value) {
      return null;
    }

    const isInteger = Number.isInteger(Number(control.value));
    const hasDecimalPoint = control.value.toString().includes('.');

    return isInteger && !hasDecimalPoint ? null : { notInteger: true };
  }

  private validateEmails(controlValue: string): Observable<string[] | null> {
    const emails = this.parseEmailString(controlValue);

    const invalidEmails = emails.filter((email) => {
      const tempEmailControl = new FormControl(email, Validators.email);
      return tempEmailControl.invalid;
    });

    return of(invalidEmails.length ? invalidEmails : null);
  }

  private delayedEmailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        this.emailValidationErrors = [];
        return of(null);
      }
      this.isAsyncValidating = true;

      return timer(1000).pipe(
        switchMap(() => this.validateEmails(control.value)),
        map((invalidEmails) => {
          this.emailValidationErrors = invalidEmails || [];
          this.isAsyncValidating = false;
          return invalidEmails ? { invalidEmails: invalidEmails } : null;
        })
      );
    };
  }

  private giftedAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailControl = control.parent?.get('email');
      if (!control.value || !emailControl.value) {
        return null;
      }

      if (emailControl) {
        const emails = this.parseEmailString(emailControl.value as string);
        const numberOfEmails = emails.length;
        const giftedAmount = numberOfEmails * Number(control.value);
        const availableSpace = Number(this.availableSpace);
        if (giftedAmount > availableSpace) {
          return {
            isGreaterThanAvailableSpace: true,
            requiredSpace: giftedAmount,
          };
        }
        if (giftedAmount <= availableSpace) {
          return {
            positiveValidation: true,
            successMessage: `Total gifted storage: ${giftedAmount} GB`,
          };
        }
      }

      return null;
    };
  }

  private parseEmailString(emailString: string): string[] {
    return emailString.split(',').map((email) => email.trim());
  }

  public getAmountErrorMessage(): string | null {
    const errors = this.giftForm.get('amount')?.errors;
    if (errors?.isGreaterThanAvailableSpace) {
      const requiredSpace = errors.requiredSpace;
      return `You need at least ${requiredSpace} GB.`;
    }
    return null;
  }
}
