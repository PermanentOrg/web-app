import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { AccountService } from '@shared/services/account/account.service';
import { cloneDeep } from 'lodash';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from '@shared/services/storage/storage.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RelationshipService } from './relationship.service';

describe('RelationshipService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
        CookieService,
        AccountService,
        StorageService,
        RelationshipService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
  });

  it('should be created', inject(
    [RelationshipService],
    (service: RelationshipService) => {
      expect(service).toBeTruthy();
    },
  ));
});
