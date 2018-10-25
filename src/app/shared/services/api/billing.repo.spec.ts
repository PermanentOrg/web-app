import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService} from '@shared/services/http/http.service';
import { BillingRepo, BillingResponse } from '@shared/services/api/billing.repo';

describe('BillingRepo', () => {
  let repo: BillingRepo;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [HttpService]
    });

    repo = new BillingRepo(TestBed.get(HttpService));
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should successfully return no saved cards', () => {
    const expected = require('@root/test/responses/billing.getBillingCards.none.success.json');

    repo.getCards()
    .then((response: BillingResponse) => {
      const cards = response.getBillingCardVOs();
      expect(cards).toBeDefined();
      expect(cards.length).toBe(0);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/billing/getBillingCards`);
    req.flush(expected);
  });

  it('should successfully return one or more saved cards', () => {
    const expected = require('@root/test/responses/billing.getBillingCards.multiple.success.json');

    repo.getCards()
    .then((response: BillingResponse) => {
      const cards = response.getBillingCardVOs();
      expect(cards).toBeDefined();
      expect(cards.length).toBe(6);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/billing/getBillingCards`);
    req.flush(expected);
  });
});
