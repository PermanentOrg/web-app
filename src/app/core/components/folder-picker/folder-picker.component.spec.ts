import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep, some } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { SharedModule } from '@shared/shared.module';
import { FolderVO } from '@root/app/models';
import { HttpTestingController } from '@angular/common/http/testing';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { DataStatus } from '@models/data-status.enum';
import { of } from 'rxjs';
import { FolderPickerComponent } from './folder-picker.component';

describe('FolderPickerComponent', () => {
	let component: FolderPickerComponent;
	let fixture: ComponentFixture<FolderPickerComponent>;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.imports.push(SharedModule);

		config.declarations.push(FolderPickerComponent);

		config.providers.push(DataService);
		config.providers.push(ApiService);
		config.providers.push(FolderPickerService);

		TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(FolderPickerComponent);

		TestBed.inject(HttpTestingController);

		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create with no folder and should be hidden', () => {
		expect(component).toBeTruthy();
		expect(component.visible).toBeFalsy();
		expect(component.currentFolder).toBeFalsy();
	});

	it('should initialize a folder, strip out records, and load lean child folders', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const navigateMinExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');
		const myFiles = new FolderResponse(navigateMinExpected).getFolderVO();

		spyOn(api.folder, 'navigate').and.returnValue(
			of(new FolderResponse(navigateMinExpected)),
		);

		await component.setFolder(myFiles);

		expect(api.folder.navigate).toHaveBeenCalledTimes(1);
		expect(component.currentFolder).toBeTruthy();
		expect(component.currentFolder.folder_linkId).toEqual(
			myFiles.folder_linkId,
		);

		expect(some(component.currentFolder.ChildItemVOs, 'isRecord')).toBeFalsy();

		const getLeanItemsExpected = require('@root/test/responses/folder.getLeanItems.folderPicker.myFiles.success.json');
		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve(new FolderResponse(getLeanItemsExpected)),
		);

		await component.loadCurrentFolderChildData();

		expect(component.currentFolder).toBeTruthy();
		expect(some(component.currentFolder.ChildItemVOs, 'isRecord')).toBeFalsy();
		expect(
			some(
				component.currentFolder.ChildItemVOs as FolderVO[],
				(childFolder: FolderVO) =>
					childFolder.dataStatus === DataStatus.Placeholder,
			),
		).toBeFalsy();
	});
});
