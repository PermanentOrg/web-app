import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';

import { UploadButtonComponent } from './upload-button.component';
import { DataService } from '@shared/services/data/data.service';

describe('UploadButtonComponent', () => {
  let component: UploadButtonComponent;
  let fixture: ComponentFixture<UploadButtonComponent>;

  beforeEach(async(() => {
    const config = Testing.BASE_TEST_CONFIG;
    config.declarations.push(UploadButtonComponent);
    const providers = config.providers as any[];
    providers.push(DataService);
    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
