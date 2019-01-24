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

  @ViewChild('card') elementsContainer: ElementRef;
  stripeElementsCard: any;

  constructor(
    private elementRef: ElementRef,
    private fb: FormBuilder,
    private db: AngularFireDatabase
  ) {
    this.initStripeElements();

    this.pledgeForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      donationAmount: ['', [Validators.min]],
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
  }

  bindStripeElements() {
    this.stripeElementsCard.mount(this.elementsContainer.nativeElement);
  }

  chooseDonationAmount(amount: any) {
    this.donationSelection = amount;
    if(amount !== 'custom') {
      this.donationAmount = parseInt(amount, 10);
    }
  }

  async submitPledge(formValue: any) {
    const pledge: PledgeData = {
      email: formValue.email,
      dollarAmount: this.donationAmount,
      name: formValue.name
    }

    this.waiting = true;
    await this.db.list('/pledges').push(pledge);
    this.waiting = false;
    this.pledgeForm.patchValue({
      email: null,
      name: null
    });
    this.pledgeForm.reset();
  }
}

interface PledgeData {
  email: string;
  dollarAmount: number;
  name?: string;
}
