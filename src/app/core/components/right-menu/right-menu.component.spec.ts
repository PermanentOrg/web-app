import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { RightMenuComponent } from '@core/components/right-menu/right-menu.component';
import { FolderVO, ArchiveVO } from '@models';
import { DataService } from '@shared/services/data/data.service';
import { AccountService } from '@shared/services/account/account.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RightMenuComponent', () => {
  let component: RightMenuComponent;
  let fixture: ComponentFixture<RightMenuComponent>;
  let dataService: DataService;

  beforeEach(waitForAsync(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const mockAccountService = {
      getArchive: function () {
        return new ArchiveVO({
          accessRole: 'access.role.owner',
        });
      },
      archiveChange: {
        subscribe: () => {},
      },
    };

    config.providers.push({
      provide: AccountService,
      useValue: mockAccountService,
    });

    config.declarations.push(RightMenuComponent);

    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dataService = TestBed.get(DataService);
    dataService.setCurrentFolder();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all folder actions in a folder you own', () => {
    dataService.setCurrentFolder(
      new FolderVO({
        type: 'type.folder.private',
        accessRole: 'access.role.owner',
      }),
    );

    expect(component.hasAllowedActions).toBeTruthy();
    expect(component.allowedActions.createFolder).toBeTruthy();
  });

  it('should have folder view actions in a folder you have viewer access to', () => {
    dataService.setCurrentFolder(
      new FolderVO({
        type: 'type.folder.private',
        accessRole: 'access.role.viewer',
      }),
    );

    expect(component.hasAllowedActions).toBeTruthy();
    expect(component.allowedActions.createFolder).toBeFalsy();
  });

  it('should have all folder actions in a folder you have editor access to', () => {
    dataService.setCurrentFolder(
      new FolderVO({
        type: 'type.folder.private',
        accessRole: 'access.role.editor',
      }),
    );

    expect(component.hasAllowedActions).toBeTruthy();
    expect(component.allowedActions.createFolder).toBeTruthy();
  });

  it('should have all folder actions in a folder you have contributor access to', () => {
    dataService.setCurrentFolder(
      new FolderVO({
        type: 'type.folder.private',
        accessRole: 'access.role.contributor',
      }),
    );

    expect(component.hasAllowedActions).toBeTruthy();
    expect(component.allowedActions.createFolder).toBeTruthy();
  });

  it('should have all folder actions in a folder you have curator access to', () => {
    dataService.setCurrentFolder(
      new FolderVO({
        type: 'type.folder.private',
        accessRole: 'access.role.curator',
      }),
    );

    expect(component.hasAllowedActions).toBeTruthy();
    expect(component.allowedActions.createFolder).toBeTruthy();
  });

  it('should have no view actions in a share root folder', () => {
    dataService.setCurrentFolder(
      new FolderVO({
        type: 'type.folder.root.share',
      }),
    );

    expect(component.hasAllowedActions).toBeFalsy();
    expect(component.allowedActions.createFolder).toBeFalsy();
  });

  it('should have no view actions in an apps folder', () => {
    dataService.setCurrentFolder(
      new FolderVO({
        type: 'type.folder.root.apps',
      }),
    );

    expect(component.hasAllowedActions).toBeFalsy();
    expect(component.allowedActions.createFolder).toBeFalsy();
  });
});
