import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { NavComponent } from './nav.component';
import { LeftMenuComponent } from '@core/components/left-menu/left-menu.component';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(Testing.async(() => {
    const config = Testing.BASE_TEST_CONFIG;

    config.declarations = [
      NavComponent,
      LeftMenuComponent
    ];

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
