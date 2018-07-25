import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';

describe('FolderResolveService', () => {
  beforeEach(() => {
    const config = Testing.BASE_TEST_CONFIG;
    const providers = config.providers as any[];
    providers.push(FolderResolveService);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([FolderResolveService], (service: FolderResolveService) => {
    expect(service).toBeTruthy();
  }));
});
