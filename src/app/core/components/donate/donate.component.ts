import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { find } from 'lodash';

import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';

import { AccountVO, BillingCardVO, BillingPaymentVO, BillingPaymentVOData } from '@models';

import APP_CONFIG from '@root/app/app.config';
import { ActivatedRoute } from '@angular/router';
import { PromptService, PromptField } from '@shared/services/prompt/prompt.service';
import { BillingResponse, AccountResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';

import { CREDIT_CARD_FIELDS, ADDRESS_FIELDS } from '@shared/components/prompt/prompt-fields';
import { Deferred } from '@root/vendor/deferred';

const DEFAULT_STORAGE_AMOUNT = 10;

export enum DonationStage {
  Storage,
  Permanent,
  ByteForByte,
  Payment,
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
  public cards: BillingCardVO[];
  public currentAddress: any;
  public waiting: boolean;

  public storageOptions = [1, 3, 5, 10, 25];
  public storageAmount = DEFAULT_STORAGE_AMOUNT;
  public pricePerGb: number = APP_CONFIG.pricePerGb;
  @ViewChild('customStorageAmount', { static: true }) customStorageInput: ElementRef;

  public extraDonation = APP_CONFIG.pricePerGb * DEFAULT_STORAGE_AMOUNT;
  @ViewChild('customDonationAmount', { static: true }) customDonationInput: ElementRef;

  public byteForByte = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: ApiService,
    private accountService: AccountService,
    private promptService: PromptService,
    private messageService: MessageService
  ) {
    this.cards = route.snapshot.data.cards || [];

    let selectedCard: BillingCardVO;

    if (this.cards.length) {
      selectedCard = find(this.cards, 'isDefault') as BillingCardVO;
    }

    const account = this.accountService.getAccount();

    if (account.address) {
      this.currentAddress = {
        address: account.address,
        address2: account.address2,
        city: account.city,
        state: account.state,
        zip: account.zip
      };
    }

    this.donationForm = fb.group({
      storageAmount: [DEFAULT_STORAGE_AMOUNT, [Validators.required]],
      customStorageAmount: [''],
      extraDonation: ['suggested', [Validators.required]],
      customExtraDonationAmount: [''],
      paymentCard: [selectedCard, [Validators.required]],
    });

    this.donationForm.controls['customStorageAmount'].valueChanges.subscribe((value) => {
      this.checkCustomStorageAmount(value);
    });

    this.donationForm.controls['customExtraDonationAmount'].valueChanges.subscribe((value) => {
      this.checkCustomDonationAmount(value);
    });
  }

  checkCustomStorageAmount(value) {
    if (value < 0) {
      return this.donationForm.controls['customStorageAmount'].setValue(0);
    }
    value = value === null ? null : parseInt(value, 10);

    if (this.donationForm.value.storageAmount === 'custom') {
      this.storageAmount = value === null ? 0 : value;
    }

    this.donationForm.controls['customStorageAmount'].setValue(value, {emitEvent: false});
    this.extraDonation = this.storageAmount * this.pricePerGb;
  }

  checkCustomDonationAmount(value) {
    if (value < 0) {
      return this.donationForm.controls['customExtraDonationAmount'].setValue(1);
    }
    value = value === null ? null : parseInt(value, 10);

    if (this.donationForm.value.extraDonation === 'custom') {
      this.extraDonation = value === null ? 0 : value;
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
      this.customDonationInput.nativeElement.focus();
      if (this.donationForm.value.customExtraDonationAmount !== this.storageAmount * this.pricePerGb) {
        this.extraDonation = this.storageAmount * this.pricePerGb;
      }
      this.donationForm.controls['customExtraDonationAmount'].setValue(this.extraDonation);
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
    window.scrollTo(0, 0);
  }

  addCard() {
    let newCard: BillingCardVO;
    const fields = CREDIT_CARD_FIELDS;
    const deferred = new Deferred();

    this.promptService.prompt(fields, 'Add credit card', deferred.promise)
      .then((value) => {
        newCard = new BillingCardVO({
          nickname: value.cardNickname,
          creditCardNbr: value.cardNumber,
          CVC: value.cardCvc,
          expirationMonth: value.cardExpMonth,
          expirationYear: value.cardExpYear
        });

        return this.api.billing.addCard(newCard);
      })
      .then((response: BillingResponse) => {
        this.cards.push(newCard);
        this.donationForm.patchValue({paymentCard: newCard});
        this.messageService.showMessage('Card added successfully', 'success');
        deferred.resolve();
      })
      .catch((response: BillingResponse) => {
        if (response) {
          this.messageService.showError(response.getMessage(), true);
          deferred.reject();
        }
      });
  }

  addAddress() {
    let newAddress: any;
    const fields = ADDRESS_FIELDS;
    const deferred = new Deferred();

    this.promptService.prompt(fields, 'Add address', deferred.promise)
      .then((value) => {
        newAddress = value;
        const changes = new AccountVO(value);
        return this.accountService.updateAccount(changes);
      })
      .then(() => {
        this.messageService.showMessage('Address updated successfully', 'success');
        this.currentAddress = newAddress;
        deferred.resolve();
      })
      .catch((response: AccountResponse) => {
        if (response) {
          this.messageService.showError(response.getMessage(), true);
          deferred.reject();
        }
      });
  }

  onSubmit(formValue: any) {
    const account = this.accountService.getAccount();
    const card = formValue.paymentCard;

    const spaceAmountInGb = Number(this.storageAmount);
    const storageAmount = spaceAmountInGb * this.pricePerGb;

    const donationAmount = Number(this.extraDonation);
    const donationMatchAmount = this.byteForByte ? (donationAmount + storageAmount) : 0;

    const payment = new BillingPaymentVO({
      accountIdThatPaid: account.accountId,
      refIdToIncrease: account.accountId,
      donationAmount: donationAmount,
      donationMatchAmount: donationMatchAmount,
      storageAmount: storageAmount,
      monetaryAmount: this.getTotalDonation().toFixed(2),
      spaceAmountInGb: spaceAmountInGb
    });

    this.waiting = true;

    this.api.billing.processPayment(card, payment)
      .then((response: BillingResponse) => {
        this.waiting = false;
        this.messageService.showMessage('Donation successful', 'success');
        this.donationStage = DonationStage.Complete;
      })
      .catch((response: BillingResponse) => {
        this.waiting = false;
        this.messageService.showError(response.getMessage(), true);
      });
  }

  unfocusOnEnter(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.customStorageInput.nativeElement.blur();
      this.customDonationInput.nativeElement.blur();
      event.stopPropagation();
      event.preventDefault();
    }
  }

}
