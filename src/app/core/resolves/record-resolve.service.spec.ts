import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';

import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { DataService } from '@shared/services/data/data.service';

describe('RecordResolveService', () => {
  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const providers = config.providers;
    providers.push(RecordResolveService);
    providers.push(DataService);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([RecordResolveService], (service: RecordResolveService) => {
    expect(service).toBeTruthy();
  }));
});
