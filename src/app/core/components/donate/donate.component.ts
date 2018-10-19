import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { find } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';

import { BillingCardVO } from '@models/billing-card-vo';

import APP_CONFIG from '@root/app/app.config';
import { ActivatedRoute } from '@angular/router';
import { PromptService, PromptField } from '@core/services/prompt/prompt.service';

const DEFAULT_STORAGE_AMOUNT = 3;

enum DonationStage {
  Storage,
  Permanent,
  ByteForByte,
  Payment,
  Confirm,
  Complete
}

@Component({
  selector: 'pr-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent {
  public donationStage: DonationStage = DonationStage.Payment;
  public donationForm: FormGroup;
  public cards: BillingCardVO[];
  public selectedCard: BillingCardVO = null;

  public storageOptions = [1, 3, 5, 10, 25];
  public storageAmount = DEFAULT_STORAGE_AMOUNT;
  public pricePerGb: number = APP_CONFIG.pricePerGb;
  @ViewChild('customStorageAmount') customStorageInput: ElementRef;

  public extraDonation = APP_CONFIG.pricePerGb * DEFAULT_STORAGE_AMOUNT;
  @ViewChild('customDonationAmount') customDonationInput: ElementRef;

  public byteForByte = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: ApiService,
    private accountService: AccountService,
    private promptService: PromptService
  ) {
    this.cards = route.snapshot.data.cards || [];

    if (this.cards.length) {
      this.selectedCard = find(this.cards, 'isDefault') as BillingCardVO;
    }

    this.donationForm = fb.group({
      storageAmount: [DEFAULT_STORAGE_AMOUNT, [Validators.required]],
      customStorageAmount: [''],
      extraDonation: ['suggested', [Validators.required]],
      customExtraDonationAmount: [''],
    });

    this.donationForm.controls['customStorageAmount'].valueChanges.subscribe((value) => {
      this.checkCustomStorageAmount(value);
    });

    this.donationForm.controls['customExtraDonationAmount'].valueChanges.subscribe((value) => {
      this.checkCustomDonationAmount(value);
    });
  }

  checkCustomStorageAmount(value) {
    if (value < 1) {
      return this.donationForm.controls['customStorageAmount'].setValue(1);
    }
    value = parseInt(value, 10);

    if (this.donationForm.value.storageAmount === 'custom') {
      this.storageAmount = value;
    }

    this.donationForm.controls['customStorageAmount'].setValue(value, {emitEvent: false});
  }

  checkCustomDonationAmount(value) {
    if (value < 1) {
      return this.donationForm.controls['customExtraDonationAmount'].setValue(1);
    }
    value = parseInt(value, 10);

    if (this.donationForm.value.extraDonation === 'custom') {
      this.extraDonation = value;
    }

    this.donationForm.controls['customExtraDonationAmount'].setValue(value, {emitEvent: false});
  }

  setStorageAmount(amount: string | Number) {
    this.donationForm.controls['storageAmount'].setValue(amount.toString());
    if (amount !== 'custom') {
      this.storageAmount = Number(amount);
    } else {
      if (!this.donationForm.value.customStorageAmount) {
        this.donationForm.controls['customStorageAmount'].setValue(this.storageAmount || 10);
      }
      this.storageAmount = this.donationForm.value.customStorageAmount;
      this.customStorageInput.nativeElement.focus();
    }

    this.extraDonation = this.storageAmount * this.pricePerGb;
  }

  setExtraDonation(amount: string) {
    this.donationForm.controls['extraDonation'].setValue(amount);
    if (amount === 'custom') {
      this.customStorageInput.nativeElement.focus();
      if (this.donationForm.value.customExtraDonationAmount !== this.storageAmount * this.pricePerGb) {
        this.extraDonation = this.storageAmount * this.pricePerGb;
      }
    } else if (amount === 'suggested') {
      this.extraDonation = this.storageAmount * this.pricePerGb;
    } else {
      this.extraDonation = 0;
    }
  }

  setByteForByte(byteForByte) {
    this.byteForByte = byteForByte;
  }

  getTotalDonation() {
    return (this.pricePerGb * this.storageAmount + (this.donationStage > 0 ? this.extraDonation : 0)) * (this.byteForByte ? 2 : 1);
  }

  nextStep() {
    this.donationStage++;
  }

  addCard() {
    const expMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const expYears = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

    const fields: PromptField[] = [
      {
        fieldName: 'cardNumber',
        placeholder: 'Card number',
        type: 'tel',
        validators: [Validators.required],
        config: {
          autocomplete: 'cc-number',
          autocorrect: 'off',
          autocapitalize: 'off'
        }
      },
      {
        fieldName: 'cardCvc',
        placeholder: 'Security code',
        type: 'tel',
        validators: [Validators.required],
        config: {
          autocomplete: 'cc-csc',
          autocorrect: 'off',
          autocapitalize: 'off'
        }
      },
      {
        fieldName: 'cardExpMonth',
        placeholder: 'Expiration month',
        type: 'select',
        validators: [Validators.required],
        config: {
          autocomplete: 'cc-exp-month',
          autocorrect: 'off',
          autocapitalize: 'off'
        },
        selectOptions: expMonths.map((month) => {
          return {
            text: month,
            value: month
          };
        })
      },
      {
        fieldName: 'cardExpYear',
        placeholder: 'Expiration year',
        type: 'select',
        validators: [Validators.required],
        config: {
          autocomplete: 'cc-exp-yeah',
          autocorrect: 'off',
          autocapitalize: 'off'
        },
        selectOptions: expYears.map((year) => {
          return {
            text: year,
            value: year
          };
        })
      },
      {
        fieldName: 'cardZip',
        placeholder: 'Billing zip code',
        type: 'tel',
        validators: [Validators.required],
        config: {
          autocomplete: 'postal-code',
          autocorrect: 'off',
          autocapitalize: 'off'
        }
      },
    ];

    this.promptService.prompt(fields, 'Add credit card')
      .then((value) => {
        console.log(value);
      });
  }

}
