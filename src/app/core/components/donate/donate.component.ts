import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';

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
export class DonateComponent implements OnInit {
  public donationStage: DonationStage = DonationStage.Storage;
  public donationForm: FormGroup;
  public storageOptions = [1, 3, 5, 10, 25];

  constructor(
    fb: FormBuilder,
    api: ApiService,
    accountService: AccountService
  ) {
    this.donationForm = fb.group({
      storageAmount: ['10', [Validators.required]],
      customAmount: [''],
    });
  }

  ngOnInit() {
  }

  setStorageAmount(amount: string | Number ) {
    this.donationForm.controls['storageAmount'].setValue(amount.toString());
    console.log(this.donationForm.value);
  }

}
