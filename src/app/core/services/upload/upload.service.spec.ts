import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';

import { UploadService } from '@core/services/upload/upload.service';
import { DataService } from '@shared/services/data/data.service';

describe('UploadService', () => {
  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const providers = config.providers as any[];
    providers.push(UploadService);
    providers.push(DataService);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([UploadService], (service: UploadService) => {
    expect(service).toBeTruthy();
  }));
});
