import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import APP_CONFIG from '@root/app/app.config';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { AccountResponse } from '@shared/services/api/index.repo';
import { PledgeService } from '@pledge/services/pledge.service';
import { PledgeData } from '../new-pledge/new-pledge.component';

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
    private accountService: AccountService,
    private pledgeService: PledgeService
  ) {
    if (!pledgeService.currentPledge) {
      this.router.navigate(['/pledge']);
      return this;
    }

    const params = route.snapshot.queryParams;

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
      formValue.email, formValue.name, formValue.password, formValue.password,
      formValue.agreed, formValue.optIn, null, 'permanent archive'
    ).then(async (response: AccountResponse) => {
        const account = response.getAccountVO();
        await this.pledgeService.linkAccount(account);
        this.accountService.logIn(formValue.email, formValue.password, true, true)
          .then(() => {
            // this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}.`, 'success');
          });
      })
      .catch((response: AccountResponse) => {
        // this.message.showError(response.getMessage(), true);
        this.waiting = false;
      });
  }

}
