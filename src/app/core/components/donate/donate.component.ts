import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';

import APP_CONFIG from '@root/app/app.config';

const DEFAULT_STORAGE_AMOUNT = 3;

enum DonationStage {
  Storage,
  Permanent,
  ByteForByte,
  Confirm,
  Complete
}

@Component({
  selector: 'pr-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent {
  public donationStage: DonationStage = DonationStage.Storage;
  public donationForm: FormGroup;

  public storageOptions = [1, 3, 5, 10, 25];
  public storageAmount = DEFAULT_STORAGE_AMOUNT;
  public pricePerGb: number = APP_CONFIG.pricePerGb;
  @ViewChild('customStorageAmount') customStorageInput: ElementRef;

  public extraDonation = APP_CONFIG.pricePerGb * DEFAULT_STORAGE_AMOUNT;
  @ViewChild('customDonationAmount') customDonationInput: ElementRef;

  public byteForByte = false;

  constructor(
    fb: FormBuilder,
    api: ApiService,
    accountService: AccountService
  ) {
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

}
