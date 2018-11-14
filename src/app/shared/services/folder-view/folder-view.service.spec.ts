import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';

import { FolderViewService } from '@shared/services/folder-view/folder-view.service';

describe('FolderViewService', () => {
  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const providers = config.providers;
    providers.push(FolderViewService);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([FolderViewService], (service: FolderViewService) => {
    expect(service).toBeTruthy();
  }));
});
