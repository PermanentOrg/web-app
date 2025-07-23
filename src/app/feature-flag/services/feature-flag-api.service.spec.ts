/* @format */
import { TestBed } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { environment } from '@root/environments/environment';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { FeatureFlag } from '../types/feature-flag';
import { FeatureFlagApiService } from './feature-flag-api.service';

describe('FeatureFlagApiService', () => {
	let service: FeatureFlagApiService;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				HttpV2Service,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
		service = TestBed.inject(FeatureFlagApiService);
		http = TestBed.inject(HttpTestingController);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('can fetch feature flags from the back end', (done) => {
		const expectedFlags = {
			items: [{ name: 'potato' }, { name: 'tomato' }],
		};

		service
			.getFeatureFlags()
			.then((flags) => {
				expect(flags).toEqual(expectedFlags.items);
				done();
			})
			.catch(() => {
				done.fail();
			});

		const req = http.expectOne(`${environment.apiUrl}/v2/feature-flags`);

		expect(req.request.method).toBe('GET');
		expect(req.request.headers.get('Request-Version')).toBe('2');
		expect(req.request.headers.get('Authorization')).toBeFalsy();
		req.flush(expectedFlags);
	});

	it('can silently handles errors from the server', (done) => {
		service
			.getFeatureFlags()
			.then((flags) => {
				expect(flags.length).toBe(0);
				done();
			})
			.catch(() => {
				done.fail();
			});

		const req = http.expectOne(`${environment.apiUrl}/v2/feature-flags`);
		req.flush({}, { status: 400, statusText: 'Bad Request' });
	});
});
