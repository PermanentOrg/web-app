import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderVO, RecordVO } from '@root/app/models';
import { FolderResponse } from '@shared/services/api/index.repo';
import { HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@root/environments/environment';
import { DataStatus } from '@models/data-status.enum';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

const navigateMinData = require('@root/test/responses/folder.navigateMin.success.json');
const getLeanItemsData = require('@root/test/responses/folder.getLeanItems.success.json');
const getFullRecordsData = require('@root/test/responses/record.get.multiple.success.json');

const testFolder = new FolderVO({ folderId: 1, displayName: 'test folder' });
const testRecord = new RecordVO({
	recordId: 1,
	displayName: 'test record',
	folder_linkId: 4,
	archiveNbr: 'archivenbr',
});

describe('DataService', () => {
	beforeEach(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(NgbTooltipModule);
		const providers = config.providers;
		providers.push(DataService);
		providers.push(ApiService);
		TestBed.configureTestingModule(config);
	});

	it('should be created', () => {
		const service = TestBed.inject(DataService);

		expect(service).toBeTruthy();
	});

	it('should set the current folder', () => {
		const service = TestBed.inject(DataService);
		service.setCurrentFolder(testFolder);

		expect(service.currentFolder).toEqual(testFolder);
	});

	it('should emit when the current folder is set', () => {
		const service = TestBed.inject(DataService);
		service.setCurrentFolder(null);

		expect(service.currentFolder).toBeNull();
		service.currentFolderChange.subscribe((newFolder: FolderVO) => {
			expect(newFolder).toEqual(testFolder);
			expect(service.currentFolder).toEqual(testFolder);
		});
		service.setCurrentFolder(testFolder);
	});

	it('should register an item, return the item, and unregister the item', () => {
		const service = TestBed.inject(DataService);
		service.setCurrentFolder(testFolder);
		service.registerItem(testRecord);

		expect(service.getItemByFolderLinkId(testRecord.folder_linkId)).toBe(
			testRecord,
		);
		service.unregisterItem(testRecord);

		expect(
			service.getItemByFolderLinkId(testRecord.folder_linkId),
		).toBeUndefined();
	});

	it('should fetch lean data for placeholder items', (done) => {
		const service = TestBed.inject(DataService);
		const httpMock = TestBed.inject(HttpTestingController);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);

		currentFolder.ChildItemVOs.forEach((item: RecordVO | FolderVO) => {
			service.registerItem(item);
		});

		service
			.fetchLeanItems(currentFolder.ChildItemVOs)
			.then(() => {
				currentFolder.ChildItemVOs.forEach((item) => {
					expect(item.dataStatus).toEqual(DataStatus.Lean);
				});
				done();
			})
			.catch(done.fail);

		const req = httpMock.expectOne(`${environment.apiUrl}/folder/getLeanItems`);
		req.flush(getLeanItemsData);
	});

	it('should handle an empty array when fetching lean data', (done) => {
		const service = TestBed.inject(DataService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);

		service
			.fetchLeanItems([])
			.then((count) => {
				expect(count).toBe(0);
				done();
			})
			.catch(() => {
				fail();
			});
	});

	it('should fetch full data for placeholder items', (done) => {
		const service = TestBed.inject(DataService);
		const httpMock = TestBed.inject(HttpTestingController);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);

		currentFolder.ChildItemVOs.forEach((item: RecordVO | FolderVO) => {
			service.registerItem(item);
		});

		const records = currentFolder.ChildItemVOs.filter((item) => item.isRecord);

		service
			.fetchFullItems(records)
			.then(() => {
				records.forEach((item) => {
					expect(item.dataStatus).toEqual(DataStatus.Full);
				});
				done();
			})
			.catch(done.fail);

		const req = httpMock.expectOne(
			`${environment.apiUrl}/v2/record?recordIds[]=55381&recordIds[]=54846&recordIds[]=54845`,
		);
		req.flush(getFullRecordsData);
	});

	it('should handle an empty array when fetching full data', async () => {
		const service = TestBed.inject(DataService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);

		await service.fetchFullItems([]);
	});

	it('should refresh the current folder with latest data', (done) => {
		const service = TestBed.inject(DataService);
		const httpMock = TestBed.inject(HttpTestingController);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		const childItemCount = currentFolder.ChildItemVOs.length;

		currentFolder.ChildItemVOs = [];
		service.setCurrentFolder(currentFolder);

		service
			.refreshCurrentFolder()
			.then(() => {
				expect(currentFolder.ChildItemVOs.length).toBe(childItemCount);
				done();
			})
			.catch(done.fail);

		const req = httpMock.expectOne(`${environment.apiUrl}/folder/navigateMin`);
		req.flush(navigateMinData);
	});

	it('should add items to thumbRefreshQueue that meet the criteria', (done) => {
		const service = TestBed.inject(DataService);
		const httpMock = TestBed.inject(HttpTestingController);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);

		currentFolder.ChildItemVOs.forEach((item: RecordVO | FolderVO) => {
			service.registerItem(item);
		});

		service
			.fetchLeanItems(currentFolder.ChildItemVOs)
			.then(() => {
				currentFolder.ChildItemVOs.forEach((item) => {
					expect(service.getThumbRefreshQueue()).not.toContain(item);
				});
				done();
			})
			.catch(done.fail);

		const req = httpMock.expectOne(`${environment.apiUrl}/folder/getLeanItems`);
		req.flush(getLeanItemsData);
	});
});
