import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';

import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { AccountService } from '@shared/services/account/account.service';
import { TEST_DATA } from '@core/core.module.spec';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { AccountVO, ArchiveVO } from '@models/index';

describe('LeftMenuComponent', () => {
  let component: LeftMenuComponent;
  let fixture: ComponentFixture<LeftMenuComponent>;
  let accountService: AccountService;

  beforeEach(async(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    config.declarations.push(LeftMenuComponent);
    config.declarations.push(ArchiveSmallComponent);
    config.declarations.push(BgImageSrcDirective);

    TestBed.configureTestingModule(config).compileComponents();

    accountService = TestBed.get(AccountService);
    accountService.setAccount(new AccountVO(TEST_DATA.account));
    accountService.setArchive(new ArchiveVO(TEST_DATA.archive));
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
    expect(component.archive.fullName).toEqual(TEST_DATA.archive.fullName);
  });
});
