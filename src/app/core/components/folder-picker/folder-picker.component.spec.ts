import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { FolderPickerComponent } from './folder-picker.component';
import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { SharedModule } from '@shared/shared.module';

fdescribe('FolderPickerComponent', () => {
  let component: FolderPickerComponent;
  let fixture: ComponentFixture<FolderPickerComponent>;

  beforeEach(async(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.imports.push(SharedModule);

    config.declarations.push(FolderPickerComponent);

    config.providers.push(DataService);
    config.providers.push(ApiService);

    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with no folder and should be hidden', () => {
    expect(component).toBeTruthy();
    expect(component.visible).toBeFalsy();
    expect(component.currentFolder).toBeFalsy();
  });
});
