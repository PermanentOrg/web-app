import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';

import { PromptComponent } from './prompt.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

describe('PromptComponent', () => {
  let component: PromptComponent;
  let fixture: ComponentFixture<PromptComponent>;

  beforeEach(waitForAsync(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    config.declarations = [
      FormInputComponent,
      PromptComponent
    ];
    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
