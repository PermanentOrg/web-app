import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { UploadService } from '@core/services/upload/upload.service';

describe('UploadService', () => {
  beforeEach(() => {
    const config = Testing.BASE_TEST_CONFIG;
    const providers = config.providers as any[];
    providers.push(UploadService);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([UploadService], (service: UploadService) => {
    expect(service).toBeTruthy();
  }));
});
