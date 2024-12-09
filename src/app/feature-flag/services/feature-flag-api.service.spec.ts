/* @format */
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { environment } from '@root/environments/environment';
import { FeatureFlag } from '../types/feature-flag';
import { FeatureFlagApiService } from './feature-flag-api.service';

describe('FeatureFlagApiService', () => {
  let service: FeatureFlagApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpV2Service],
    });
    service = TestBed.inject(FeatureFlagApiService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can fetch feature flags from the back end', (done) => {
    const expectedFlags = {
      items: [
        { name: 'potato', globallyEnabled: true },
        { name: 'tomato', globallyEnabled: true },
      ],
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
