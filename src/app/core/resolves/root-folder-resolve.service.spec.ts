import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';

describe('RootFolderResolveService', () => {
  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const providers = config.providers as any[];
    providers.push(RootFolderResolveService);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject(
    [RootFolderResolveService],
    (service: RootFolderResolveService) => {
      expect(service).toBeTruthy();
    },
  ));
});
