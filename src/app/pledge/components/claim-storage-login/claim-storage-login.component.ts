import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { ApiService } from '@shared/services/api/api.service';
import { PledgeService } from '@pledge/services/pledge.service';

import APP_CONFIG from '@root/app/app.config';
import { AuthResponse, ArchiveResponse, AccountResponse } from '@shared/services/api/index.repo';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-claim-storage-login',
  templateUrl: './claim-storage-login.component.html',
  styleUrls: ['./claim-storage-login.component.scss']
})
export class ClaimStorageLoginComponent implements OnInit {
  public waiting = false;
  public loggedIn = false;
  public needsMfa = false;

  public loginForm: FormGroup;
  public mfaForm: FormGroup;

  constructor(
    private accountService: AccountService,
    private api: ApiService,
    private pledgeService: PledgeService,
    private router: Router,
    private fb: FormBuilder,
    private message: MessageService,
    private cookies: CookieService
  ) {
    if (!pledgeService.currentPledge) {
      this.router.navigate(['/pledge']);
      return this;
    }

    if (this.accountService.getAccount()) {
      this.loggedIn = true;
    }

    this.loginForm = fb.group({
      email: [this.cookies.get('rememberMe'), [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(APP_CONFIG.passwordMinLength)]],
      rememberMe: [true],
      keepLoggedIn: [true]
    });

    this.mfaForm = fb.group({
      'token': [],
    });
  }

  ngOnInit() {

  }

  async logOut() {
    this.waiting = true;
    try {
      const response = await this.accountService.logOut();
      this.waiting = false;
      if (response.isSuccessful) {
        this.loggedIn = false;
        this.needsMfa = false;
      }
    } catch (err) {
      this.waiting = false;
    }
  }

  async onLoginSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.logIn(formValue.email, formValue.password, formValue.rememberMe, formValue.keepLoggedIn)
      .then(async (response: AuthResponse) => {
        this.waiting = false;
        if (response.needsMFA()) {
          this.needsMfa = true;
          this.message.showMessage(`Verify to continue as ${this.accountService.getAccount().primaryEmail}.`, 'warning');
        } else {
          this.loggedIn = true;
        }
      })
      .catch((response: AuthResponse) => {
        this.waiting = false;

        if (response.messageIncludes && response.messageIncludes('warning.signin.unknown')) {
          this.message.showMessage('Incorrect email or password.', 'danger');
          this.loginForm.patchValue({
            password: ''
          });
        } else {
          this.message.showMessage('Log in failed. Please try again.', 'danger');
        }
      });
  }

  async onMfaSubmit(formValue: any) {
    this.waiting = true;

    this.accountService.verifyMfa(formValue.token)
      .then(() => {
        return this.accountService.switchToDefaultArchive();
      })
      .then(async (response: ArchiveResponse) => {
        this.waiting = false;
        this.message.showMessage(`Logged in as ${this.accountService.getAccount().primaryEmail}.`, 'success');
        this.loggedIn = true;
        this.needsMfa = false;
      })
      .catch((response: AuthResponse | AccountResponse) => {
        this.waiting = false;
        this.message.showError(response.getMessage(), true);
      });
  }

  async claimStorage() {
    this.waiting = true;

    const pledgeId = this.pledgeService.getPledgeId();
    const account = this.accountService.getAccount();
    const payment = this.pledgeService.createBillingPaymentVo(account);

    try {
      await this.pledgeService.linkAccount(account);
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
