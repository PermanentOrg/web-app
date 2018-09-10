import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import * as Testing from '@root/test/testbedConfig';

import { EditService } from '@core/services/edit/edit.service';
import { ApiService } from '@shared/services/api/api.service';

describe('EditService', () => {
  beforeEach(() => {
    const config = Testing.BASE_TEST_CONFIG;

    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([EditService], (service: EditService) => {
    expect(service).toBeTruthy();
  }));
});
