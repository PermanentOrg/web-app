import { TestBed, inject } from '@angular/core/testing';

import { TestResolveService } from './test-resolve.service';

describe('TestResolveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestResolveService]
    });
  });

  it('should be created', inject([TestResolveService], (service: TestResolveService) => {
    expect(service).toBeTruthy();
  }));
});
