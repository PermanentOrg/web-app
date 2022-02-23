import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import APP_CONFIG from '@root/app/app.config';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { AccountResponse } from '@shared/services/api/index.repo';
import { PledgeService } from '@pledge/services/pledge.service';
import { PledgeData } from '../new-pledge/new-pledge.component';
import { ApiService } from '@shared/services/api/api.service';

const MIN_PASSWORD_LENGTH = APP_CONFIG.passwordMinLength;

@Component({
  selector: 'pr-claim-storage',
  templateUrl: './claim-storage.component.html',
  styleUrls: ['./claim-storage.component.scss']
})
export class ClaimStorageComponent implements OnInit {
  public signupForm: FormGroup;
  public pledge: PledgeData = this.pledgeService.currentPledgeData;

  public waiting: boolean;
  public storageAmount: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private accountService: AccountService,
    private pledgeService: PledgeService
  ) {
    if (!pledgeService.currentPledgeData) {
      this.router.navigate(['..'], {relativeTo: this.route});
      return this;
    } else if (!pledgeService.currentPledgeData.timestamp) {
      this.router.navigate(['..', 'missing'], {relativeTo: this.route});
      return this;
    }

    this.pledge = pledgeService.currentPledgeData;

    this.signupForm = fb.group({
      email: [this.pledge.email || '', [Validators.required, Validators.email]],
      name: [this.pledge.name || '', Validators.required],
      password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      agreed: [false, [Validators.requiredTrue]],
      optIn: [true]
    });
  }

  ngOnInit() {
  }

  async onSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.signUp(
      formValue.email,
      formValue.name,
      formValue.password,
      formValue.password,
      formValue.agreed,
      formValue.optIn,
      null,
      null,
    ).then(async (response: AccountResponse) => {
        const account = response.getAccountVO();
        await this.pledgeService.linkAccount(account);
        await this.accountService.logIn(formValue.email, formValue.password, true, true);

        const billingVo = this.pledgeService.createBillingPaymentVo(account);

        const billingResponse = await this.api.billing.claimPledge(billingVo, this.pledgeService.getPledgeId());

        this.waiting = false;

        if (billingResponse.isSuccessful) {
          this.router.navigate(['..', 'done'], {relativeTo: this.route});
        }

      })
      .catch((response: AccountResponse) => {
        // this.message.showError(response.getMessage(), true);
        this.waiting = false;
      });
  }

}
