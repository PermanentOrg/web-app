import { TestBed, inject } from '@angular/core/testing';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';

describe('FolderResolveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FolderResolveService]
    });
  });

  it('should be created', inject([FolderResolveService], (service: FolderResolveService) => {
    expect(service).toBeTruthy();
  }));
});
