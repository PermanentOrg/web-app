import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { PledgeService } from '@pledge/services/pledge.service';
import { PledgeData } from '../new-pledge/new-pledge.component';
import { BillingPaymentVO } from '@models/index';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-claim-storage-login',
  templateUrl: './claim-storage-login.component.html',
  styleUrls: ['./claim-storage-login.component.scss']
})
export class ClaimStorageLoginComponent implements OnInit {
  public waiting = false;

  constructor(
    private accountService: AccountService,
    private api: ApiService,
    private pledgeService: PledgeService,
    private router: Router
  ) {
    if (!pledgeService.currentPledge) {
      this.router.navigate(['/pledge']);
      return this;
    }
  }

  ngOnInit() {

  }

  async claimStorage() {
    this.waiting = true;

    const pledgeId = this.pledgeService.getPledgeId();
    const pledge = this.pledgeService.currentPledgeData as PledgeData;
    const account = this.accountService.getAccount();

    const payment = new BillingPaymentVO({
      accountIdThatPaid: account.accountId,
      refIdToIncrease: account.accountId,
      donationAmount: 0,
      donationMatchAmount: 0,
      storageAmount: pledge.dollarAmount,
      monetaryAmount: pledge.dollarAmount.toFixed(2),
      spaceAmountInGb: Math.floor(pledge.dollarAmount / 10)
    });

    try {
      const billingResponse = await this.api.billing.claimPledge(payment, pledgeId);
      this.waiting = false;
      if (billingResponse.isSuccessful) {
        this.router.navigate(['/pledge', 'done']);
      } else {
        console.error(billingResponse);
      }
    } catch (err) {
      this.waiting = false;
      console.error(err);
    }
  }

}
