import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';

import { DonateComponent } from './donate.component';
import { SharedModule } from '@shared/shared.module';
import { AccountService } from '@shared/services/account/account.service';
import { TEST_DATA } from '@core/core.module.spec';
import APP_CONFIG from '@root/app/app.config';

describe('DonateComponent', () => {
  let component: DonateComponent;
  let fixture: ComponentFixture<DonateComponent>;
  let accountService: AccountService;

  beforeEach(async(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.imports.push(SharedModule);
    config.declarations.push(DonateComponent);
    config.providers.push(AccountService);

    TestBed.configureTestingModule(config)
    .compileComponents();

    accountService = TestBed.get(AccountService);
    accountService.setAccount(TEST_DATA.account);
    accountService.setArchive(TEST_DATA.archive);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DonateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have defaults as set from config file', () => {
    expect(component.pricePerGb).toEqual(APP_CONFIG.pricePerGb);
    expect(component.storageAmount).toEqual(10);
    expect(component.byteForByte).toBeFalsy();
    expect(component.donationStage).toEqual(0);
  });
});
