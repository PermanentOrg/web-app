import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { EditPromptComponent } from './edit-prompt.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

describe('EditPromptComponent', () => {
  let component: EditPromptComponent;
  let fixture: ComponentFixture<EditPromptComponent>;

  beforeEach(async(() => {
    const config = Testing.BASE_TEST_CONFIG;
    config.declarations = [
      FormInputComponent,
      EditPromptComponent
    ];
    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
