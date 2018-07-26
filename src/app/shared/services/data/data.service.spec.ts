import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { DataService } from '@shared/services/data/data.service';

describe('DataService', () => {
  beforeEach(() => {
    const config = Testing.BASE_TEST_CONFIG;
    const providers = config.providers as any[];
    providers.push(DataService);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([DataService], (service: DataService) => {
    expect(service).toBeTruthy();
  }));
});
