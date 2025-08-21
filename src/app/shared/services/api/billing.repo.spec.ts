import { TestBed } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import {
	BillingRepo,
	BillingResponse,
	ClaimingPromoResponse,
} from '@shared/services/api/billing.repo';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpV2Service } from '../http-v2/http-v2.service';

const apiUrl = (endpoint: string) => `${environment.apiUrl}${endpoint}`;

describe('BillingRepo', () => {
	let repo: BillingRepo;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				HttpService,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
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
		const mockResponseData = {
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

		const mockResponse = new ClaimingPromoResponse(mockResponseData);

		const promise = repo.redeemPromoCode(promo);

		const req = httpMock.expectOne(apiUrl('/promo/entry'));

		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual({ code: 'TESTCODE' });

		req.flush(mockResponseData);
		const response = await promise;

		expect(response).toEqual([mockResponse]);
	});
});
