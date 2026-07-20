import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep, some } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { SharedModule } from '@shared/shared.module';
import { FolderVO } from '@root/app/models';
import { HttpTestingController } from '@angular/common/http/testing';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { DataStatus } from '@models/data-status.enum';
import { FolderPickerComponent } from './folder-picker.component';

const buildRootFolderResponse = () =>
	new FolderResponse({
		isSuccessful: true,
		Results: [
			{
				data: [
					{
						FolderVO: {
							folderId: 1,
							folder_linkId: 10,
							type: 'type.folder.root.root',
							displayName: 'Root',
							ChildItemVOs: [
								{ folder_linkId: 11, type: 'type.folder.root.private' },
								{ folder_linkId: 12, type: 'type.folder.root.app' },
								{ folder_linkId: 13, type: 'type.folder.root.vault' },
							],
						},
					},
				],
			},
		],
	});

const buildErrorFolderResponse = (errorMessage: string) => {
	const errorResponse = new FolderResponse();
	errorResponse.Results = [{ message: [errorMessage] }];
	return errorResponse;
};

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

		// myFiles is type.folder.root.private (not root.root), so setFolder
		// takes the getWithChildren branch.
		const getWithChildrenSpy = spyOn(
			api.folder,
			'getWithChildren',
		).and.resolveTo(new FolderResponse(navigateMinExpected));

		await component.setFolder(myFiles);

		expect(getWithChildrenSpy).toHaveBeenCalledTimes(1);
		expect(component.currentFolder).toBeTruthy();
		expect(component.currentFolder.folder_linkId).toEqual(
			myFiles.folder_linkId,
		);

		expect(some(component.currentFolder.ChildItemVOs, 'isRecord')).toBeFalsy();

		const getLeanItemsExpected = require('@root/test/responses/folder.getLeanItems.folderPicker.myFiles.success.json');
		getWithChildrenSpy.and.resolveTo(new FolderResponse(getLeanItemsExpected));

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

	it('should load the root folder via getRoot and strip app and vault folders', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const getRootSpy = spyOn(api.folder, 'getRoot').and.resolveTo(
			buildRootFolderResponse(),
		);
		const getWithChildrenSpy = spyOn(api.folder, 'getWithChildren');
		const rootFolder = buildRootFolderResponse().getFolderVO();

		await component.setFolder(rootFolder);

		expect(getRootSpy).toHaveBeenCalledTimes(1);
		expect(getWithChildrenSpy).not.toHaveBeenCalled();
		expect(component.isRootFolder).toBeTrue();
		expect(
			some(component.currentFolder.ChildItemVOs, (item) =>
				item.type.includes('type.folder.root.app'),
			),
		).toBeFalse();

		expect(
			some(component.currentFolder.ChildItemVOs, (item) =>
				item.type.includes('type.folder.root.vault'),
			),
		).toBeFalse();
	});

	it('should show an error and leave the current folder unchanged when the response is unsuccessful', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const message = TestBed.inject(MessageService) as MessageService;
		spyOn(api.folder, 'getWithChildren').and.resolveTo(
			buildErrorFolderResponse('Folder not found'),
		);
		const showErrorSpy = spyOn(message, 'showError');

		await component.setFolder(
			new FolderVO({ folderId: 42, type: 'type.folder.private' }),
		);

		expect(showErrorSpy).toHaveBeenCalledWith({
			message: 'Folder not found',
			translate: true,
		});

		expect(component.currentFolder).toBeFalsy();
	});
});
