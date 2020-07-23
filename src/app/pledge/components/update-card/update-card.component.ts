import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PledgeData } from 'functions/src/models';
import { AngularFireDatabase } from '@angular/fire/database';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@root/environments/environment';

const stripe = window['Stripe'](environment.stripeKey);
const elements = stripe.elements();

@Component({
  selector: 'pr-update-card',
  templateUrl: './update-card.component.html',
  styleUrls: ['./update-card.component.scss']
})
export class UpdateCardComponent implements OnInit, AfterViewInit {
  pledgeId: string;
  pledgeData: PledgeData;

  @ViewChild('card', { static: true }) elementsContainer: ElementRef;
  stripeElementsCard: any;
  cardError: any;
  cardComplete = false;

  cardSaved = true;

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
  ) {
    this.initStripeElements();
    this.pledgeId = this.route.snapshot.params.pledgeId;
  }

  async ngOnInit() {
    this.pledgeData = (await this.db.database.ref('/pledges').child(this.pledgeId).once('value')).val() as PledgeData;
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

}
