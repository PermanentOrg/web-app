import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep, some, remove } from 'lodash';
import { environment } from '@root/environments/environment';

import { FolderPickerComponent } from './folder-picker.component';
import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { SharedModule } from '@shared/shared.module';
import { FolderVO } from '@root/app/models';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { DataStatus } from '@models/data-status.enum';
import { of } from 'rxjs';

fdescribe('FolderPickerComponent', () => {
  let component: FolderPickerComponent;
  let fixture: ComponentFixture<FolderPickerComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);

    config.imports.push(SharedModule);

    config.declarations.push(FolderPickerComponent);

    config.providers.push(DataService);
    config.providers.push(ApiService);
    config.providers.push(FolderPickerService);

    TestBed.configureTestingModule(config).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderPickerComponent);

    httpMock = TestBed.get(HttpTestingController);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with no folder and should be hidden', () => {
    expect(component).toBeTruthy();
    expect(component.visible).toBeFalsy();
    expect(component.currentFolder).toBeFalsy();
  });

  it('should initialize a folder and strip out any child records', () => {
    const myFiles = new FolderVO({
      folder_linkId: 158329
    });

    const navigateMinExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');

    component.setFolder(myFiles)
      .then(() => {
        expect(component.currentFolder).toBeTruthy();
        expect(component.currentFolder.folder_linkId).toEqual(myFiles.folder_linkId);
        expect(some(component.currentFolder.ChildItemVOs, 'isRecord')).toBeFalsy();
      });

    const navigateReq = httpMock.match(`${environment.apiUrl}/folder/navigateMin`)[0];
    navigateReq.flush(navigateMinExpected);
  });

  it('should fetch data for folders in an initialized folder', () => {
    const navigateMinExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');
    const getLeanItemsExpected = require('@root/test/responses/folder.getLeanItems.folderPicker.myFiles.success.json');
    const myFiles = new FolderResponse(navigateMinExpected).getFolderVO(true);

    remove(myFiles.ChildItemVOs, 'isRecord');
    component.currentFolder = myFiles;

    component.loadCurrentFolderChildData()
      .then(() => {
        expect(component.currentFolder).toBeTruthy();
        expect(some(component.currentFolder.ChildItemVOs, 'isRecord')).toBeFalsy();
        expect(some(component.currentFolder.ChildItemVOs as FolderVO[], (childFolder: FolderVO) => {
          return childFolder.dataStatus === DataStatus.Placeholder;
        })).toBeFalsy();
      });

    const getLeanReq = httpMock.match(`${environment.apiUrl}/folder/getLeanItems`)[0];
    getLeanReq.flush(getLeanItemsExpected);
  });

  fit('test spy on repo instead of http mock', async () => {
    const navigateMinExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');
    const myFiles = new FolderResponse(navigateMinExpected).getFolderVO();
    const api = TestBed.get(ApiService) as ApiService;

    spyOn(api.folder, 'navigate').and.returnValue(of(new FolderResponse(navigateMinExpected)));

    await component.setFolder(myFiles);

    expect(api.folder.navigate).toHaveBeenCalledTimes(1);
    expect(component.currentFolder).toBeTruthy();
    expect(component.currentFolder.folder_linkId).toEqual(myFiles.folder_linkId);
    expect(some(component.currentFolder.ChildItemVOs, 'isRecord')).toBeFalsy();
  });
});
