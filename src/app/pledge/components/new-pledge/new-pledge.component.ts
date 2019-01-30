import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PledgeService } from '@pledge/services/pledge.service';
import APP_CONFIG from '@root/app/app.config';

const stripe = window['Stripe']('pk_test_kGSsLxH88lyxBUp9Lluji2Rn');
const elements = stripe.elements();

@Component({
  selector: 'pr-new-pledge',
  templateUrl: './new-pledge.component.html',
  styleUrls: ['./new-pledge.component.scss']
})
export class NewPledgeComponent implements OnInit, AfterViewInit {
  public waiting: boolean;
  public pledgeForm: FormGroup;

  public donationLevels = [10, 50, 100];

  public donationSelection: any = 50;
  public donationAmount = 50;

  public pricePerGb = 10;

  @ViewChild('customDonationAmount') customDonationInput: ElementRef;

  @ViewChild('card') elementsContainer: ElementRef;
  stripeElementsCard: any;
  cardError: any;
  cardComplete = false;

  constructor(
    private fb: FormBuilder,
    private pledgeService: PledgeService,
    private router: Router
  ) {
    this.initStripeElements();

    this.pledgeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      customDonationAmount: [''],
      name: ['']
    });
  }

  ngOnInit() {
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
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
          '::placeholder:': {
            color: '#6c757d'
          }
        }
      }
    }
    this.stripeElementsCard = elements.create('card', options);

    this.stripeElementsCard.addEventListener('change', event => {
      if(event.error) {
        this.cardError = event.error.message;
      } else {
        this.cardError = null;
      }

      if(event.complete) {
        this.cardComplete = true;
      } else {
        this.cardComplete = false;
      }
    });
  }

  bindStripeElements() {
    this.stripeElementsCard.mount(this.elementsContainer.nativeElement);
  }

  chooseDonationAmount(amount: any) {
    this.donationSelection = amount;
    if(amount !== 'custom') {
      this.donationAmount = parseInt(amount, 10);
    } else {
      if(!this.pledgeForm.value.customDonationAmount) {
        this.pledgeForm.patchValue({
          customDonationAmount: this.donationAmount
        });
      }
      this.customDonationInput.nativeElement.focus();
    }
  }

  async submitPledge(formValue: any) {

    this.waiting = true;

    const stripeResult = await stripe.createToken(this.stripeElementsCard);

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
      timestamp: new Date().getTime()
    };

    await this.pledgeService.createPledge(pledge);
    this.waiting = false;
    this.pledgeForm.patchValue({
      email: null,
      name: null
    });
    this.pledgeForm.reset();

    const storageAmount = Math.floor(pledge.dollarAmount / this.pricePerGb);



    this.router.navigate(['/pledge', 'claim'], { queryParams: {
      name: pledge.name,
      email: pledge.email,
      storageAmount: Math.floor(pledge.dollarAmount / this.pricePerGb)
    }});
  }

  unfocusOnEnter(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.customDonationInput.nativeElement.blur();
      event.stopPropagation();
      event.preventDefault();
    }
  }
}

export interface PledgeData {
  email: string;
  dollarAmount: number;
  name?: string;
  stripeToken?: string;
  timestamp?: number;
  accountId?: number;
}
