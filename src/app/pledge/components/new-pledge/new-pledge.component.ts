import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

const stripe = window['Stripe']('pk_test_kGSsLxH88lyxBUp9Lluji2Rn');
const elements = stripe.elements();

@Component({
  selector: 'pr-new-pledge',
  templateUrl: './new-pledge.component.html',
  styleUrls: ['./new-pledge.component.scss']
})
export class NewPledgeComponent implements OnInit, AfterViewInit {
  public pledgeForm: FormGroup;

  @ViewChild('card') elementsContainer: ElementRef;
  stripeElementsCard: any;

  constructor(
    private elementRef: ElementRef,
    private fb: FormBuilder
  ) {
    this.initStripeElements();

    this.pledgeForm = fb.group({
      email: [''],
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


}
