/* @format */
import { TestBed } from '@angular/core/testing';

import { MixpanelService } from './mixpanel.service';

describe('MixPanelService', () => {
  let service: MixpanelService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MixpanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be disabled in tests', () => {
    expect(service.isEnabled()).toBeFalse();
  });
});
