/* @format */
import { TestBed, inject } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { HttpService } from '@shared/services/http/http.service';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { HttpV2Service } from '../http-v2/http-v2.service';
import { IdPuser } from './idpuser.repo';

describe('IdpUser', () => {
	let repo: IdPuser;
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

		repo = new IdPuser(
			TestBed.inject(HttpService),
			TestBed.inject(HttpV2Service),
		);
		httpMock = TestBed.get(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should return a list of all the available two-step methods', () => {
		const expected = [
			{ methodId: 'ABCD1', method: 'mail', value: 'test@example.com' },
		];

		repo.getTwoFactorMethods().then((response) => {
			expect(response).toEqual(expected);
		});

		const req = httpMock.expectOne(`${environment.apiUrl}/v2/idpuser`);
	});
});
