/* @format */
import { TestBed, inject } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import {
  BillingRepo,
  BillingResponse,
  ClaimingPromoResponse,
} from '@shared/services/api/billing.repo';
import { HttpV2Service } from '../http-v2/http-v2.service';

describe('BillingRepo', () => {
  let repo: BillingRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpService],
    });

    repo = new BillingRepo(
      TestBed.inject(HttpService),
      TestBed.inject(HttpV2Service),
    );
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send a POST request and return expected response', async () => {
    const promo = { code: 'TESTCODE' };
    const mockResponse: ClaimingPromoResponse = {
      sizeInMB: 1000,
      promoId: 123,
      code: 'TESTCODE',
      expiresDT: '2025-12-31T23:59:59Z',
      remainingUses: 5,
      status: 'ACTIVE',
      type: 'valid',
      createdDT: '2025-12-31T23:59:59Z',
      updatedDT: '2025-12-31T23:59:59Z',
    };

    const response = await repo.redeemPromoCode(promo);
    expect(response).toEqual([mockResponse]);

    const req = httpMock.expectOne('/promo/entry');
    expect(req.request.method).toBe('POST');
  });
});
