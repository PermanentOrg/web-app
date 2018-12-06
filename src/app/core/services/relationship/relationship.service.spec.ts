import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { RelationshipService } from './relationship.service';
import { AccountService } from '@shared/services/account/account.service';
import { cloneDeep } from 'lodash';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from '@shared/services/storage/storage.service';

describe('RelationshipService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        CookieService,
        AccountService,
        StorageService,
        RelationshipService
      ]
    });
  });

  it('should be created', inject([RelationshipService], (service: RelationshipService) => {
    expect(service).toBeTruthy();
  }));
});
