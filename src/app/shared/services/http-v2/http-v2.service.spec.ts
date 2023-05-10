import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { getFirst, HttpV2Service } from './http-v2.service';
import { environment } from '@root/environments/environment';
import { StorageService } from '../storage/storage.service';

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

describe('HttpV2Service', () => {
  let service: HttpV2Service;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(HttpV2Service);
    httpClient = TestBed.inject(HttpClient);
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
      });

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
      });

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
      });
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
      });

    const request = httpTestingController.expectOne(
      apiUrl('/api/v2/health?test=potato')
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
      });

    const request = httpTestingController.expectOne(
      apiUrl('/api/v2/health?id=32')
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
      });

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
      'Bearer auth_token'
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
      });

    const request = httpTestingController.expectOne(apiUrl('/api/v2/health'));
    request.flush([{ status: 'available' }, { status: 'unavailable' }]);
  });

  it('can prevent csrf from being sent', () => {
    service.post('/api/v2/health', {}, HealthResponse).toPromise();

    const req = httpTestingController.expectOne(apiUrl('/api/v2/health'));
    expect(req.request.body.csrf).toBeUndefined();
  });
});
