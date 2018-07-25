import { TestBed, inject } from '@angular/core/testing';

import { RootFolderResolveService } from '@core/resolves/root-folder-resolve.service';

describe('RootFolderResolveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RootFolderResolveService]
    });
  });

  it('should be created', inject([RootFolderResolveService], (service: RootFolderResolveService) => {
    expect(service).toBeTruthy();
  }));
});
