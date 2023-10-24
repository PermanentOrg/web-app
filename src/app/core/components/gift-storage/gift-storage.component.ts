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
import {
  Observable,
  BehaviorSubject,
  Subscription,
  of,
  timer,
  forkJoin,
} from 'rxjs';
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
  duplicateEmails: string[] = [];

  public isSuccessful: boolean = false;
  public giftResult: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private subscriptions: Subscription[] = [];
  public isAsyncValidating: boolean;
  public successMessage: string = '';
  public emails: string[] = [];

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
          asyncValidators: [this.combinedEmailValidator()],
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
          const giftedAmount = Number(this.giftForm.value.amount);
          this.emails = this.parseEmailString(this.giftForm.value.email);
          const remainingSpaceAfterGift =
            Number(this.availableSpace) - this.emails.length * giftedAmount;
          this.availableSpace = String(remainingSpaceAfterGift);

          const remainingSpaceInBytes =
            remainingSpaceAfterGift * this.bytesPerGigabyte;

          const totalSpace =
            this.account.spaceTotal -
            giftedAmount * this.emails.length * this.bytesPerGigabyte;

          const newAccount = new AccountVO({
            ...this.account,
            spaceLeft: remainingSpaceInBytes,
            spaceTotal: totalSpace,
          });

          this.accountService.setAccount(newAccount);
          this.isSuccessful = isSuccessful;
        }
      })
    ),
      this.giftForm.get('email')?.valueChanges.subscribe((value) => {
        this.successMessage = '';
        this.giftForm.get('amount')?.updateValueAndValidity();

        if (!value) {
          if (this.emailValidationErrors.length) {
            this.emailValidationErrors = [];
          }
          if (this.duplicateEmails.length) {
            this.duplicateEmails = [];
          }
        }
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
    this.dialog.open(
      'ConfirmGiftDialogComponent',
      {
        emails,
        amount: value.amount,
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

  private combinedEmailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        this.emailValidationErrors = [];
        this.duplicateEmails = [];
        return of(null);
      }

      this.isAsyncValidating = true;

      return timer(1000).pipe(
        switchMap(() => {
          return forkJoin({
            invalidEmails: this.validateEmails(control.value),
            duplicateEmails: this.checkForDuplicateEmails(control.value),
          });
        }),
        map(({ invalidEmails, duplicateEmails }) => {
          this.emailValidationErrors = invalidEmails || [];
          this.duplicateEmails = duplicateEmails || [];
          this.isAsyncValidating = false;

          let errors: ValidationErrors | null = null;

          if (invalidEmails?.length > 0) {
            errors = { ...errors, invalidEmails: true };
          }
          if (duplicateEmails?.length > 0) {
            errors = { ...errors, duplicateEmails: true };
          }

          return errors;
        })
      );
    };
  }

  private giftedAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailControl = control.parent?.get('email');
      if (!control.value || !emailControl.value) {
        this.successMessage = '';
        return null;
      }

      if (emailControl) {
        const emails = this.parseEmailString(emailControl.value as string);
        const numberOfEmails = emails.length;
        const giftedAmount = numberOfEmails * Number(control.value);
        const availableSpace = Number(this.availableSpace);
        if (giftedAmount > availableSpace) {
          this.successMessage = '';

          return {
            isGreaterThanAvailableSpace: true,
            requiredSpace: giftedAmount,
          };
        }
        if (giftedAmount <= availableSpace) {
          this.successMessage = `Total gifted storage: ${giftedAmount} GB`;
        }
      }

      return null;
    };
  }

  public parseEmailString(emailString: string): string[] {
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

  public checkForDuplicateEmails(
    emailsString: string
  ): Observable<string[] | null> {
    const emails = this.parseEmailString(emailsString);
    const emailCount = {};
    const duplicates: string[] = [];

    emails.forEach((email) => {
      if (!emailCount[email]) {
        emailCount[email] = 1;
      } else {
        emailCount[email]++;
      }
    });

    Object.keys(emailCount).forEach((key) => {
      if (emailCount[key] > 1) {
        duplicates.push(key);
      }
    });

    return of(duplicates.length ? duplicates : null);
  }
}
