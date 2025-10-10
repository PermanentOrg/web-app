import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@root/environments/environment';
import { firstValueFrom } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { SecretsService } from '../secrets/secrets.service';
import { getFirst, HttpV2Service } from './http-v2.service';

const apiUrl = (endpoint: string) => `${environment.apiUrl}${endpoint}`;

class HealthResponse {
	public status: 'unavailable' | 'available';
	public constructorCalled: boolean;

	constructor(data: any) {
		if (data?.status) {
			this.status = data.status;
		}
		this.constructorCalled = true;
	}
}

class MockSecretService {
	public static stelaDomain: string | undefined;

	public static reset(): void {
		MockSecretService.stelaDomain = undefined;
	}

	public get() {
		return MockSecretService.stelaDomain;
	}
}

describe('HttpV2Service', () => {
	let service: HttpV2Service;
	let httpTestingController: HttpTestingController;
	let storage: StorageService;

	beforeEach(() => {
		MockSecretService.reset();
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				{
					provide: SecretsService,
					useClass: MockSecretService,
				},
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
		service = TestBed.inject(HttpV2Service);
		httpTestingController = TestBed.inject(HttpTestingController);
		storage = TestBed.inject(StorageService);

		storage.session.set('CSRF', 'csrf_token');
		service.clearAuthToken();
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should be able to make a request as a promise', (done) => {
		getFirst(service.post('/api/v2/health', {}))
			.toPromise()
			.then((response: any) => {
				expect(response.status).toBe('available');
				done();
			})
			.catch(done.fail);

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(request.request.method).toEqual('POST');
		expect(request.request.headers.get('Request-Version')).toBe('2');
		expect(request.request.headers.has('Authorization')).toBeFalse();
		request.flush({ status: 'available' });
	});

	it('should be able to pass in CSRF token in POST requests', () => {
		service.post('/api/v2/health', {}, null, { csrf: true }).toPromise();

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(request.request.body.csrf).toBeDefined();
		request.flush({ status: 'available' });
	});

	it('should be able to pass in a response class', (done) => {
		service
			.post('/api/v2/health', {}, HealthResponse)
			.toPromise()
			.then((response) => {
				const resp = response[0];

				expect(resp instanceof HealthResponse).toBeTrue();
				expect(resp.status).toBe('available');
				expect(resp.constructorCalled).toBeTrue();
				done();
			})
			.catch(done.fail);

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));
		request.flush({ status: 'available' });
	});

	it('should set the new csrf token', (done) => {
		const response = {
			status: 'available',
			csrf: 'potato',
		};

		service
			.post('/api/v2/health', {})
			.toPromise()
			.then(() => {
				expect(storage.session.get('CSRF')).toBe('potato');
				done();
			})
			.catch(done.fail);
		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));
		request.flush(response);
	});

	it('should be able to make a GET request', (done) => {
		service
			.get('/api/v2/health', { test: 'potato' })
			.toPromise()
			.then(() => {
				expect(storage.session.get('CSRF')).toBe('csrf_token');
				done();
			})
			.catch(done.fail);

		const request = httpTestingController.expectOne(
			apiUrl('/api/v2/health?test=potato'),
		);

		expect(request.request.method).toBe('GET');
		expect(request.request.headers.get('Request-Version')).toBe('2');
		expect(request.request.body).toBeNull();
		request.flush({ status: 'available' });
	});

	it('should be able to make a DELETE request', (done) => {
		service
			.delete('/api/v2/health', { id: 32 })
			.toPromise()
			.then(() => {
				expect(storage.session.get('CSRF')).toBe('csrf_token');
				done();
			})
			.catch(done.fail);

		const request = httpTestingController.expectOne(
			apiUrl('/api/v2/health?id=32'),
		);

		expect(request.request.method).toBe('DELETE');
		expect(request.request.headers.get('Request-Version')).toBe('2');
		expect(request.request.body).toBeNull();
		request.flush({ status: 'available' });
	});

	it('should be able to make a PUT request', (done) => {
		service
			.put('/api/v2/health', { id: 32, test: 'potato' })
			.toPromise()
			.then(() => {
				expect(storage.session.get('CSRF')).toBe('1234');
				done();
			})
			.catch(done.fail);

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(request.request.method).toBe('PUT');
		expect(request.request.headers.get('Request-Version')).toBe('2');
		expect(request.request.body).not.toBeNull();
		request.flush({ status: 'available', csrf: '1234' });
	});

	it('should not add a ? to an empty GET request', () => {
		service.get('/api/v2/health', {}).toPromise();

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(request.request.method).toBe('GET');
		request.flush({});
	});

	it('should be able to take in an authentication token', () => {
		service.setAuthToken('auth_token');
		service.get('/api/v2/health').toPromise();

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(request.request.headers.get('Authorization')).toBe(
			'Bearer auth_token',
		);
		request.flush({});
	});

	it('should be able to handle being passed an array', (done) => {
		service
			.get('/api/v2/health', {}, HealthResponse)
			.toPromise()
			.then((resp) => {
				expect(resp.length).toBe(2);
				done();
			})
			.catch(done.fail);

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));
		request.flush([{ status: 'available' }, { status: 'unavailable' }]);
	});

	it('can prevent csrf from being sent', () => {
		service.post('/api/v2/health', {}, HealthResponse).toPromise();

		const req = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(req.request.body.csrf).toBeUndefined();
	});

	it('should emit an event on a 401 Unauthorized response code', (done) => {
		let expirationObserved = false;
		const subscription = service.tokenExpired.subscribe(() => {
			expirationObserved = true;
		});

		service
			.get('/api/v2/health', {}, HealthResponse)
			.toPromise()
			.catch(() => {
				expect(expirationObserved).toBeTrue();
				subscription.unsubscribe();
				done();
			});

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));
		request.flush(
			{ error: 'error message' },
			{
				status: 401,
				statusText: 'unauthorized',
			},
		);
	});

	it('can have its stela domain configured', () => {
		MockSecretService.stelaDomain = 'https://api.local.permanent.org/api/';

		service.post('/v2/health', {}, HealthResponse).toPromise();
		httpTestingController.expectOne(
			'https://api.local.permanent.org/api/v2/health',
		);
	});

	it('uses the default api URL if no stela domain is defined', () => {
		service.post('/v2/health', {}, HealthResponse).toPromise();
		httpTestingController.expectOne(
			'https://local.permanent.org/api/v2/health',
		);
	});

	it('can configure a request to not use the stela domain', () => {
		MockSecretService.stelaDomain = 'https://api.local.permanent.org/api/';

		service
			.post('/v2/health', {}, HealthResponse, { useStelaDomain: false })
			.toPromise();
		httpTestingController.expectOne(
			'https://local.permanent.org/api/v2/health',
		);
	});

	it('should correctly handle responseType: text', (done) => {
		service
			.post('/api/v2/health', {}, undefined, {
				responseType: 'text',
			})
			.toPromise()
			.then((response) => {
				expect(typeof response[0]).toBe('string');
				expect(response[0]).toBe('OK');
				done();
			})
			.catch(done.fail);

		const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(request.request.method).toBe('POST');
		expect(request.request.headers.get('Request-Version')).toBe('2');

		request.flush('OK', { status: 200, statusText: 'OK' });
	});

	it('should be able to test if the auth token is defined', () => {
		service.setAuthToken('potato');

		expect(service.isAuthTokenSet()).toBeTruthy();

		service.clearAuthToken();

		expect(service.isAuthTokenSet()).toBeFalsy();
	});

	it('should be able to add array parameters to GET requests', (done) => {
		firstValueFrom(service.get('v2/health', { arrayVals: [1, 2, 3] })).finally(
			() => done(),
		);

		const req = httpTestingController.expectOne(
			apiUrl('/v2/health?arrayVals[]=1&arrayVals[]=2&arrayVals[]=3'),
		);

		expect(req.request.method).toBe('GET');
		expect(req.request.headers.get('Request-Version')).toBe('2');

		req.flush('OK', { status: 200, statusText: 'OK' });
	});

	it('should add X-Permanent-Share-Token header in POST request', () => {
		service
			.post('/api/v2/health', {}, null, { shareToken: 'abc123' })
			.toPromise();

		const req = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(req.request.headers.get('X-Permanent-Share-Token')).toBe('abc123');
		req.flush({ status: 'available' });
	});

	it('should add X-Permanent-Share-Token header in GET request', () => {
		service
			.get('/api/v2/health', {}, null, { shareToken: 'xyz789' })
			.toPromise();

		const req = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(req.request.headers.get('X-Permanent-Share-Token')).toBe('xyz789');
		req.flush({ status: 'available' });
	});

	it('should not include X-Permanent-Share-Token header if shareToken is null', () => {
		service.get('/api/v2/health', {}, null, { shareToken: null }).toPromise();

		const req = httpTestingController.expectOne(apiUrl('/api/v2/health'));

		expect(req.request.headers.has('X-Permanent-Share-Token')).toBeFalse();
		req.flush({ status: 'available' });
	});
});
