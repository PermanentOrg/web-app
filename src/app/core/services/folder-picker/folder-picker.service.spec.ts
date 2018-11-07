import { TestBed, inject } from '@angular/core/testing';

import { FolderPickerService } from './folder-picker.service';

describe('FolderPickerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FolderPickerService]
    });
  });

  it('should be created', inject([FolderPickerService], (service: FolderPickerService) => {
    expect(service).toBeTruthy();
  }));
});
