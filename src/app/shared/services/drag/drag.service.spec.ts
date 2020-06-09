import { TestBed } from '@angular/core/testing';

import { DragService } from './drag.service';
import { BASE_TEST_CONFIG } from '@root/test/testbedConfig';

describe('DragService', () => {
  let service: DragService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...BASE_TEST_CONFIG.imports],
      providers: [...BASE_TEST_CONFIG.providers, DragService]
    });
    service = TestBed.inject(DragService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
