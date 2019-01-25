import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database';

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

  public donationLevels = [10, 25, 100];

  public donationSelection: any = 25;
  public donationAmount = 25;

  @ViewChild('customDonationAmount') customDonationInput: ElementRef;

  @ViewChild('card') elementsContainer: ElementRef;
  stripeElementsCard: any;
  cardError: any;
  cardComplete = false;

  constructor(
    private elementRef: ElementRef,
    private fb: FormBuilder,
    private db: AngularFireDatabase
  ) {
    this.initStripeElements();

    this.pledgeForm = fb.group({
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
      stripeToken: stripeResult.token
    };

    await this.db.list('/pledges').push(pledge);
    this.waiting = false;
    this.pledgeForm.patchValue({
      email: null,
      name: null
    });
    this.pledgeForm.reset();
  }

  unfocusOnEnter(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.customDonationInput.nativeElement.blur();
      event.stopPropagation();
      event.preventDefault();
    }
  }
}

interface PledgeData {
  email: string;
  dollarAmount: number;
  name?: string;
  stripeToken?: string;
}
