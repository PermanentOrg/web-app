/* @format */
import { TestBed } from '@angular/core/testing';
import { SecretsService } from '@shared/services/secrets/secrets.service';
import { FeatureFlag } from '../types/feature-flag';
import { FEATURE_FLAG_API, FeatureFlagApi } from '../types/feature-flag-api';
import { FeatureFlagService } from './feature-flag.service';

class MockFeatureFlagApi implements FeatureFlagApi {
  public flags: FeatureFlag[] = [];

  public async getFeatureFlags(): Promise<FeatureFlag[]> {
    return this.flags;
  }
}

class MockSecretsService {
  private secrets = new Map<string, string>();
  public get(key: string) {
    return (this.secrets.has && this.secrets.get(key)) || '';
  }

  public set(key: string, value: string) {
    this.secrets.set(key, value);
  }
}

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let mockApi: MockFeatureFlagApi;
  let secrets: MockSecretsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FEATURE_FLAG_API, useClass: MockFeatureFlagApi },
        { provide: SecretsService, useClass: MockSecretsService },
      ],
    });
    service = TestBed.inject(FeatureFlagService);
    mockApi = TestBed.inject(FEATURE_FLAG_API) as MockFeatureFlagApi;
    secrets = TestBed.inject(SecretsService) as unknown as MockSecretsService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to set a feature flag', () => {
    service.set('test', true);
  });

  it('should be able to test a feature flag that is not set', () => {
    expect(service.isEnabled('potato')).toBeFalse();
  });

  it('should be able to test a feature flag that is set', () => {
    service.set('test', true);

    expect(service.isEnabled('test')).toBeTrue();
  });

  it('should fetch from the API on init', async () => {
    mockApi.flags = [
      { name: 'api0', globallyEnabled: true },
      { name: 'api1', globallyEnabled: false },
    ];
    await service.fetchFromApi();

    expect(service.isEnabled('api0')).toBeTrue();
    expect(service.isEnabled('api1')).toBeFalse();
  });

  it('should fetch from Secrets on local environment', async () => {
    secrets.set('TEST', 'true');
    secrets.set('TEST2', '');
    await service.fetchFromApi();

    expect(service.isEnabled('TEST')).toBeTrue();
    expect(service.isEnabled('TEST2')).toBeFalse();
  });
});
