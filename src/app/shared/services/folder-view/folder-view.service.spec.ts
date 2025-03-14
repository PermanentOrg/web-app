import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { FolderViewService } from '@shared/services/folder-view/folder-view.service';
import { FolderView } from './folder-view.enum';

describe('FolderViewService', () => {
  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const providers = config.providers;
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject(
    [FolderViewService],
    (service: FolderViewService) => {
      expect(service).toBeTruthy();
    },
  ));

  it('should emit folder view changes', inject(
    [FolderViewService],
    (service: FolderViewService) => {
      const newFolderView = FolderView.Grid;

      service.viewChange.subscribe((folderViewEmitted: FolderView) => {
        expect(folderViewEmitted).toEqual(newFolderView);
      });

      service.setFolderView(newFolderView);
    },
  ));
});
