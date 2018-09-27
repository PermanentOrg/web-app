import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';

import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { AccountService } from '@shared/services/account/account.service';
import { TEST_DATA } from '@core/core.module.spec';

xdescribe('LeftMenuComponent', () => {
  let component: LeftMenuComponent;
  let fixture: ComponentFixture<LeftMenuComponent>;
  let accountService: AccountService;

  beforeEach(async(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    config.declarations.push(LeftMenuComponent);

    TestBed.configureTestingModule(config).compileComponents();

    accountService = TestBed.get(AccountService);
    accountService.setAccount(TEST_DATA.account);
    accountService.setArchive(TEST_DATA.archive);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeftMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    accountService.clearAccount();
    accountService.clearArchive();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the current archive name as a property', () => {
    expect(component.archiveName).toEqual(TEST_DATA.archive.fullName);
  });
});
