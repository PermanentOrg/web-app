import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { NavComponent } from '@core/components/nav/nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';
import { RightMenuComponent } from '../right-menu/right-menu.component';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(waitForAsync(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.declarations.push(NavComponent);
    config.declarations.push(LeftMenuComponent);
    config.declarations.push(RightMenuComponent);

    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
