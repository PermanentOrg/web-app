import { TestBed, inject } from '@angular/core/testing';

import { RecordResolveService } from '@core/resolves/record-resolve.service';

describe('RecordResolveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecordResolveService]
    });
  });

  it('should be created', inject([RecordResolveService], (service: RecordResolveService) => {
    expect(service).toBeTruthy();
  }));
});
