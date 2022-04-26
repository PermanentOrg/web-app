import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';
import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';

import { InvitationsComponent } from './invitations.component';
import { SharedModule } from '@shared/shared.module';
import { AccountService } from '@shared/services/account/account.service';

import { TEST_DATA } from '@core/core.module.spec';

describe('InvitationsComponent', () => {
  let component: InvitationsComponent;
  let fixture: ComponentFixture<InvitationsComponent>;
  let accountService: AccountService;

  beforeEach(waitForAsync(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.imports.push(SharedModule);
    config.declarations.push(InvitationsComponent);
    config.providers.push(AccountService);

    TestBed.configureTestingModule(config)
    .compileComponents();

    accountService = TestBed.get(AccountService);
    accountService.setAccount(TEST_DATA.account);
    accountService.setArchive(TEST_DATA.archive);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
