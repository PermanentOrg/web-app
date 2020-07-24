import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { PledgeService } from '@pledge/services/pledge.service';
import APP_CONFIG from '@root/app/app.config';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';

import { environment } from '@root/environments/environment';
import { IFrameService } from '@shared/services/iframe/iframe.service';

const stripe = window['Stripe'](environment.stripeKey);
const elements = stripe.elements();

@Component({
  selector: 'pr-new-pledge',
  templateUrl: './new-pledge.component.html',
  styleUrls: ['./new-pledge.component.scss']
})
export class NewPledgeComponent implements OnInit, AfterViewInit, OnDestroy {
  public waiting: boolean;
  public pledgeForm: FormGroup;

  public donationLevels = [10, 20, 50];

  public donationSelection: any = 10;
  public donationAmount = 10;

  public pricePerGb = 10;

  @ViewChild('customDonationAmount', { static: true }) customDonationInput: ElementRef;

  @ViewChild('card', { static: true }) elementsContainer: ElementRef;
  stripeElementsCard: any;
  cardError: any;
  cardComplete = false;


  constructor(
    private fb: FormBuilder,
    private pledgeService: PledgeService,
    private router: Router,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private message: MessageService,
    private iframe: IFrameService
  ) {
    this.initStripeElements();
    const account = this.accountService.getAccount();

    this.pledgeForm = this.fb.group({
      email: [account ? account.primaryEmail : '', [Validators.required, Validators.email]],
      customDonationAmount: [''],
      name: [account ? account.fullName : '', [Validators.required]],
      anonymous: [false]
    });
  }

  onPledgeClick(amount: number) {
    this.chooseDonationAmount('custom');
    this.pledgeForm.patchValue({
      customDonationAmount: amount
    });
  }

  ngOnInit() {
    let pledgeAmount;
    if (!this.iframe.isIFrame()) {
      const params = this.route.snapshot.queryParams;
      if (params) {
        pledgeAmount = parseInt(params.pledgeAmount, 10);
      }
    } else {
      const url = document.referrer;
      const split = url.split('?');
      if (split.length > 1) {
        const params = split.pop();
        if (params.includes('amount')) {
          try {
            pledgeAmount = parseInt(params.split('=').pop(), 0);
          } catch (err) { }
        }
      }
    }
    if (pledgeAmount) {
      if (this.donationLevels.includes(pledgeAmount)) {
        this.chooseDonationAmount(pledgeAmount);
      } else {
        this.donationAmount = pledgeAmount;
        this.chooseDonationAmount('custom');
      }
    }
  }

  ngAfterViewInit() {
    this.bindStripeElements();

  }

  initStripeElements() {
    const options = {
      classes: {
        invalid: '.ng-invalid'
      },
      style: {
        base: {
          fontSize: '16px',
          fontFamily: 'Open Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
          '::placeholder:': {
            color: '#6c757d'
          }
        }
      }
    };
    this.stripeElementsCard = elements.create('card', options);

    this.stripeElementsCard.addEventListener('change', event => {
      if (event.error) {
        this.cardError = event.error.message;
      } else {
        this.cardError = null;
      }

      if (event.complete) {
        this.cardComplete = true;
      } else {
        this.cardComplete = false;
      }
    });
  }

  bindStripeElements() {
    this.stripeElementsCard.mount(this.elementsContainer.nativeElement);
  }

  getStorageAmount(donationAmount: number) {
    return Math.floor(donationAmount / this.pricePerGb);
  }

  chooseDonationAmount(amount: any) {
    this.donationSelection = amount;
    if (amount !== 'custom') {
      this.donationAmount = parseInt(amount, 10);
    } else {
      if (!this.pledgeForm.value.customDonationAmount) {
        this.pledgeForm.patchValue({
          customDonationAmount: this.donationAmount
        });
      }
      this.customDonationInput.nativeElement.focus();
    }
  }

  async submitPledge(formValue: any) {

    this.waiting = true;

    const stripeResult = await stripe.createToken(this.stripeElementsCard, {
      name: formValue.name
    });

    if (stripeResult.error) {
      this.waiting = false;
      this.cardError = stripeResult.error.message;
      return;
    }

    this.stripeElementsCard.clear();

    const pledge: PledgeData = {
      email: formValue.email,
      dollarAmount: this.donationSelection === 'custom' ? formValue.customDonationAmount : this.donationAmount,
      name: formValue.name,
      stripeToken: stripeResult.token.id,
      zip: stripeResult.token.card.address_zip,
      timestamp: new Date().getTime(),
      anonymous: formValue.anonymous
    };

    await this.pledgeService.createPledge(pledge);
    this.pledgeForm.patchValue({
      email: null,
      name: null
    });
    this.pledgeForm.reset();

    const isLoggedIn = await this.accountService.isLoggedIn();
    if (!isLoggedIn) {
      this.router.navigate(['/pledge', 'claim']);
    } else {
      this.router.navigate(['/pledge', 'claimlogin']);
    }
    this.waiting = false;
  }

  unfocusOnEnter(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.customDonationInput.nativeElement.blur();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  ngOnDestroy() {
  }
}

export interface PledgeData {
  email: string;
  dollarAmount: number;
  name?: string;
  stripeToken?: string;
  stripeCustomerId?: string;
  timestamp?: number;
  accountId?: number;
  claimed?: boolean;
  anonymous?: boolean;
  zip?: string;
  id?: string;
}
