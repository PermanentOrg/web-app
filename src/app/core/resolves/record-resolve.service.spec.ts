import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { RecordResolveService } from '@core/resolves/record-resolve.service';

describe('RecordResolveService', () => {
  beforeEach(() => {
    const config = Testing.BASE_TEST_CONFIG;
    const providers = config.providers as any[];
    providers.push(RecordResolveService);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([RecordResolveService], (service: RecordResolveService) => {
    expect(service).toBeTruthy();
  }));
});
