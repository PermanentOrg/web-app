import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';
import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { DonateComponent, DonationStage } from './donate.component';
import { SharedModule } from '@shared/shared.module';
import { AccountService } from '@shared/services/account/account.service';
import { TEST_DATA } from '@core/core.module.spec';
import APP_CONFIG from '@root/app/app.config';
import { ActivatedRoute } from '@angular/router';
import { BillingResponse } from '@shared/services/api/index.repo';
import { BillingPaymentVOData } from '@models/index';

const cardData = require('@root/test/responses/billing.getBillingCards.multiple.success.json');

describe('DonateComponent', () => {
  let component: DonateComponent;
  let fixture: ComponentFixture<DonateComponent>;
  let accountService: AccountService;
  const cardResponse = new BillingResponse(cardData);
  const cards = cardResponse.getBillingCardVOs();

  beforeEach(async(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.imports.push(SharedModule);
    config.declarations.push(DonateComponent);
    config.providers.push(AccountService);
    config.providers.push({
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          data: {
            cards: cards
          }
        }
      }
    });

    TestBed.configureTestingModule(config)
    .compileComponents();

    accountService = TestBed.get(AccountService);
    accountService.setAccount(TEST_DATA.account);
    accountService.setArchive(TEST_DATA.archive);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DonateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have defaults as set from config file', () => {
    expect(component.pricePerGb).toEqual(APP_CONFIG.pricePerGb);
    expect(component.storageAmount).toEqual(10);
    expect(component.byteForByte).toBeFalsy();
    expect(component.donationStage).toEqual(DonationStage.Storage);
  });

  it('should have cards data as provided in resolve', () => {
    expect(component.cards.length).toEqual(cards.length);
  });

  it('should calculate proper donation splits for storage only', () => {
    const httpMock = TestBed.get(HttpTestingController) as HttpTestingController;

    component.setStorageAmount(10);
    expect(component.storageAmount).toEqual(10);

    component.setExtraDonation('none');
    expect(component.extraDonation).toEqual(0);

    component.donationStage = DonationStage.Payment;
    expect(component.getTotalDonation()).toEqual(10 * APP_CONFIG.pricePerGb);

    component.onSubmit(component.donationForm.value);
    const req = httpMock.expectOne(`${environment.apiUrl}/billing/processPayment`);
    const requestData = req.request.body.RequestVO.data[0];
    const paymentVO: BillingPaymentVOData = requestData.BillingPaymentVO;

    expect(paymentVO.donationAmount).toEqual(0);
    expect(paymentVO.spaceAmountInGb).toEqual(10);
    expect(paymentVO.storageAmount).toEqual(10 * APP_CONFIG.pricePerGb);
    expect(paymentVO.donationMatchAmount).toEqual(0);
  });


  it('should calculate proper addl donation for custom storage amount', () => {
    const httpMock = TestBed.get(HttpTestingController) as HttpTestingController;

    component.setStorageAmount('custom');
    component.donationForm.controls['customStorageAmount'].setValue(7);
    expect(component.storageAmount).toEqual(7);
    expect(component.extraDonation).toEqual(7 * APP_CONFIG.pricePerGb);

    component.byteForByte = false;

    component.donationStage = DonationStage.Payment;

    expect(component.getTotalDonation()).toEqual(7 * APP_CONFIG.pricePerGb * 2);

    component.onSubmit(component.donationForm.value);
    const req = httpMock.expectOne(`${environment.apiUrl}/billing/processPayment`);
    const requestData = req.request.body.RequestVO.data[0];
    const paymentVO: BillingPaymentVOData = requestData.BillingPaymentVO;

    expect(paymentVO.donationAmount).toEqual(7 * APP_CONFIG.pricePerGb);
    expect(paymentVO.spaceAmountInGb).toEqual(7);
    expect(paymentVO.storageAmount).toEqual(7 * APP_CONFIG.pricePerGb);
    expect(paymentVO.donationMatchAmount).toEqual(0);
  });

  it('should calculate proper donation splits for addl donation with no match', () => {
    const httpMock = TestBed.get(HttpTestingController) as HttpTestingController;

    component.setStorageAmount(10);
    expect(component.storageAmount).toEqual(10);

    component.setExtraDonation('suggested');
    expect(component.extraDonation).toEqual(10 * APP_CONFIG.pricePerGb);

    component.donationStage = DonationStage.Payment;

    expect(component.getTotalDonation()).toEqual((10 * APP_CONFIG.pricePerGb * 2));

    component.onSubmit(component.donationForm.value);
    const req = httpMock.expectOne(`${environment.apiUrl}/billing/processPayment`);
    const requestData = req.request.body.RequestVO.data[0];
    const paymentVO: BillingPaymentVOData = requestData.BillingPaymentVO;

    expect(paymentVO.donationAmount).toEqual(10 * APP_CONFIG.pricePerGb);
    expect(paymentVO.spaceAmountInGb).toEqual(10);
    expect(paymentVO.storageAmount).toEqual(10 * APP_CONFIG.pricePerGb);
    expect(paymentVO.donationMatchAmount).toEqual(0);
  });

  it('should calculate proper donation splits for storage only with match', () => {
    const httpMock = TestBed.get(HttpTestingController) as HttpTestingController;

    component.setStorageAmount(10);
    expect(component.storageAmount).toEqual(10);

    component.setExtraDonation('none');
    expect(component.extraDonation).toEqual(0);

    component.byteForByte = true;

    component.donationStage = DonationStage.Payment;

    expect(component.getTotalDonation()).toEqual((10 * APP_CONFIG.pricePerGb * 2));

    component.onSubmit(component.donationForm.value);
    const req = httpMock.expectOne(`${environment.apiUrl}/billing/processPayment`);
    const requestData = req.request.body.RequestVO.data[0];
    const paymentVO: BillingPaymentVOData = requestData.BillingPaymentVO;

    expect(paymentVO.donationAmount).toEqual(0);
    expect(paymentVO.spaceAmountInGb).toEqual(10);
    expect(paymentVO.storageAmount).toEqual(10 * APP_CONFIG.pricePerGb);
    expect(paymentVO.donationMatchAmount).toEqual(10 * APP_CONFIG.pricePerGb);
  });

  it('should calculate proper donation splits for storage, addl donation, and match', () => {
    const httpMock = TestBed.get(HttpTestingController) as HttpTestingController;

    component.setStorageAmount(10);
    expect(component.storageAmount).toEqual(10);

    component.setExtraDonation('suggested');
    expect(component.extraDonation).toEqual(10 * APP_CONFIG.pricePerGb);

    component.byteForByte = true;

    component.donationStage = DonationStage.Payment;

    expect(component.getTotalDonation()).toEqual((10 * APP_CONFIG.pricePerGb * 4));

    component.onSubmit(component.donationForm.value);
    const req = httpMock.expectOne(`${environment.apiUrl}/billing/processPayment`);
    const requestData = req.request.body.RequestVO.data[0];
    const paymentVO: BillingPaymentVOData = requestData.BillingPaymentVO;

    expect(paymentVO.donationAmount).toEqual(10 * APP_CONFIG.pricePerGb);
    expect(paymentVO.spaceAmountInGb).toEqual(10);
    expect(paymentVO.storageAmount).toEqual(10 * APP_CONFIG.pricePerGb);
    expect(paymentVO.donationMatchAmount).toEqual(10 * APP_CONFIG.pricePerGb * 2);
  });
});
