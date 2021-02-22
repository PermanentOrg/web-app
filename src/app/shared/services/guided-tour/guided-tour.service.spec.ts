import { TestBed } from '@angular/core/testing';
import { cloneDeep } from 'lodash';
import { AccountService } from '../account/account.service';
import * as Testing from '@root/test/testbedConfig';

import { GuidedTourService } from './guided-tour.service';
import { AccountVO } from '@models';
import { ShepherdService } from 'angular-shepherd';

describe('GuidedTourService', () => {
  let service: GuidedTourService;

  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const mockAccountService = {
      getAccount: function() {
        return new AccountVO({
          accountId: 2
        });
      }
    };

    config.providers.push({
      provide: AccountService,
      useValue: mockAccountService
    },
      ShepherdService
    );
    config.providers.push(
      GuidedTourService
    );
    TestBed.configureTestingModule(config);
    service = TestBed.inject(GuidedTourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
