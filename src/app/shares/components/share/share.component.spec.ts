import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep  } from 'lodash';

import { ShareComponent } from './share.component';
import { SharedModule } from '@shared/shared.module';
import { FileListItemComponent } from '@fileBrowser/components/file-list-item/file-list-item.component';
import { ArchiveVO } from '@root/app/models';

describe('ShareComponent', () => {
  let component: ShareComponent;
  let fixture: ComponentFixture<ShareComponent>;

  beforeEach(async(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    config.imports.push(SharedModule);
    config.declarations.push(ShareComponent);
    config.declarations.push(FileListItemComponent);

    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareComponent);
    component = fixture.componentInstance;
    component.archive = new ArchiveVO({
      fullName: 'TestArchive',
      ItemVOs: []
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
