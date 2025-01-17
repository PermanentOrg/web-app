import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { EditService } from '@core/services/edit/edit.service';
import { ApiService } from '@shared/services/api/api.service';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

describe('EditService', () => {
  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    config.imports.push(NgbTooltipModule);
    TestBed.configureTestingModule(config);
  });

  it('should be created', inject([EditService], (service: EditService) => {
    expect(service).toBeTruthy();
  }));
});
