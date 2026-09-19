import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';

import { DataService } from '@shared/services/data/data.service';
import { FolderVO, FolderVOData, RecordVO } from '@root/app/models';
import {
	FolderResponse,
	RecordResponse,
} from '@shared/services/api/index.repo';
import { of } from 'rxjs';
import { DataStatus } from '@models/data-status.enum';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '@shared/services/api/api.service';

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
const childItemVOsMock = [
	{
		folder_linkId: '233483',
		archiveNbr: '05r0-016p',
	},
	{
		folder_linkId: '233484',
		archiveNbr: '05r0-016p',
	},
	{
		folder_linkId: '224722',
		archiveNbr: '05r0-016p',
	},
	{
		folder_linkId: '223367',
		archiveNbr: '05r0-016p',
	},
	{
		folder_linkId: '223366',
		archiveNbr: '05r0-016p',
	},
	{
		folder_linkId: '233485',
		archiveNbr: '05r0-016p',
	},
];

// we should refactor the data service test suite and mock all the dependencies
// so we do not have to fix the tests everytime an injected service changes
describe('DataService', () => {
	beforeEach(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(NgbTooltipModule);
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
		const api = TestBed.inject(ApiService);
		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({ ChildItemVOs: childItemVOsMock }),
			} as unknown as FolderResponse),
		);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);

		currentFolder.ChildItemVOs.forEach((item: RecordVO | FolderVO) => {
			service.registerItem(item);
		});

		service
			.fetchLeanItems(currentFolder.ChildItemVOs)
			.then(() => {
				expect(api.folder.getWithChildren).toHaveBeenCalled();
				currentFolder.ChildItemVOs.forEach((item) => {
					expect(item.dataStatus).toEqual(DataStatus.Lean);
				});
				done();
			})
			.catch(done.fail);
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

	it('should return 0 and reset items when fetchLeanItems response is unsuccessful', (done) => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: false,
			} as unknown as FolderResponse),
		);

		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);
		currentFolder.ChildItemVOs.forEach((item: RecordVO | FolderVO) => {
			service.registerItem(item);
		});
		const rejects: number[] = [];
		currentFolder.ChildItemVOs.forEach((item, index) => {
			item.fetched = new Promise((resolve, reject) => {
				const wrappedReject = () => {
					rejects.push(index);
					reject();
				};
				(item as any)._reject = wrappedReject;
			});
		});

		service
			.fetchLeanItems(currentFolder.ChildItemVOs)
			.then((count) => {
				expect(count).toBe(0);
				currentFolder.ChildItemVOs.forEach((item) => {
					expect(item.isFetching).toBeFalse();
					expect(item.fetched).toBeNull();
				});
				done();
			})
			.catch(done.fail);
	});

	// the method fetchFullItems uses both the record.repo and the folder.repo
	// and the data service test suite does not create mocks for them
	// because the methods api.folder.getWithChildren and api.record.get
	// have changed this test fails, even with the timeout
	// taking into account the above, the best solution would be to disable
	// this test, to avoid it from failing on future changes in the dependecies

	/* eslint-disable jasmine/no-disabled-tests */
	xit('should fetch full data for placeholder items', async () => {
		const service = TestBed.inject(DataService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);

		currentFolder.ChildItemVOs.forEach((item: RecordVO | FolderVO) => {
			service.registerItem(item);
		});

		const records = currentFolder.ChildItemVOs.filter((item) => item.isRecord);

		const httpV2Service = TestBed.inject(HttpV2Service);
		spyOn(httpV2Service, 'get').and.returnValue(of(getFullRecordsData));

		await service.fetchFullItems(records);

		expect(httpV2Service.get).toHaveBeenCalledWith(
			'v2/record',
			jasmine.any(Object),
		);
		// using timeout is not ideal and 3000ms is just by trial and error to make sure that
		// the records reference has been updated, because we do not have real control over
		// the way that is being changed in an async way.
		// More details: https://github.com/PermanentOrg/web-app/issues/830
		setTimeout(() => {
			records.forEach((item) => {
				expect(item.dataStatus).toEqual(DataStatus.Full);
			});
		}, 3000);
	});
	/* eslint-enable jasmine/no-disabled-tests */

	it('should handle an empty array when fetching full data', async () => {
		const service = TestBed.inject(DataService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true);
		service.setCurrentFolder(currentFolder);

		await service.fetchFullItems([]);
	});

	describe('fetchFullItems', () => {
		const buildRecordResponse = (recordsData: object[]) =>
			new RecordResponse({
				isSuccessful: true,
				Results: recordsData.map((recordData) => ({
					data: [{ RecordVO: recordData }],
				})),
			});

		const buildFolderVOsResponse = (foldersData: FolderVOData[]) =>
			new FolderResponse({
				isSuccessful: true,
				Results: foldersData.map((folderData) => ({
					data: [{ FolderVO: folderData }],
				})),
			});

		let service: DataService;
		let recordGet: jasmine.Spy;
		let getStelaFolderVOs: jasmine.Spy;

		beforeEach(() => {
			service = TestBed.inject(DataService);
			const api = TestBed.inject(ApiService);
			recordGet = spyOn(api.record, 'get');
			getStelaFolderVOs = spyOn(api.folder, 'getStelaFolderVOs');
			service.setCurrentFolder(testFolder);
		});

		it('should match records to the response by recordId, not by position', async () => {
			const firstRecord = new RecordVO({ recordId: '11', archiveNbr: 'a' });
			const secondRecord = new RecordVO({ recordId: '22', archiveNbr: 'b' });
			recordGet.and.resolveTo(
				buildRecordResponse([
					{ recordId: '22', displayName: 'second' },
					{ recordId: '11', displayName: 'first' },
				]),
			);

			await service.fetchFullItems([firstRecord, secondRecord]);

			expect(firstRecord.displayName).toBe('first');
			expect(secondRecord.displayName).toBe('second');
		});

		it('should leave a record the response skipped below Full so it can be fetched again', async () => {
			const returnedRecord = new RecordVO({ recordId: '11', archiveNbr: 'a' });
			const skippedRecord = new RecordVO({
				recordId: '22',
				archiveNbr: 'b',
				displayName: 'lean name',
			});
			recordGet.and.resolveTo(
				buildRecordResponse([{ recordId: '11', displayName: 'first' }]),
			);

			await service.fetchFullItems([returnedRecord, skippedRecord]);

			expect(returnedRecord.dataStatus).toBe(DataStatus.Full);
			expect(skippedRecord.dataStatus).toBeLessThan(DataStatus.Full);
			expect(skippedRecord.displayName).toBe('lean name');
		});

		it('should match folders to the response by folderId, not by position', async () => {
			const folderWithoutId = new FolderVO({ folder_linkId: 1 });
			const folderWithId = new FolderVO({ folderId: '33', folder_linkId: 2 });
			getStelaFolderVOs.and.resolveTo(
				buildFolderVOsResponse([{ folderId: '33', displayName: 'real name' }]),
			);

			await service.fetchFullItems([folderWithoutId, folderWithId]);

			expect(folderWithId.displayName).toBe('real name');
			expect(folderWithoutId.displayName).toBeUndefined();
			expect(folderWithoutId.dataStatus).toBeLessThan(DataStatus.Full);
		});

		it('should clear isFetching once the items have been fetched', async () => {
			const record = new RecordVO({ recordId: '11', archiveNbr: 'a' });
			recordGet.and.resolveTo(
				buildRecordResponse([{ recordId: '11', displayName: 'first' }]),
			);

			await service.fetchFullItems([record]);

			expect(record.isFetching).toBeFalse();
		});

		it('should clear isFetching when the request fails', async () => {
			const record = new RecordVO({ recordId: '11', archiveNbr: 'a' });
			recordGet.and.rejectWith(new Error('nope'));

			await service.fetchFullItems([record]);

			expect(record.isFetching).toBeFalse();
		});
	});

	describe('refreshCurrentFolder', () => {
		const berlinFolderData = {
			folderId: '1',
			folder_linkId: 1,
			displayName: 'Berlin',
			updatedDT: '2024-01-01T00:00:00.000Z',
		};
		const amsterdamRecordData = {
			recordId: '2',
			folder_linkId: 2,
			displayName: 'Amsterdam',
			updatedDT: '2024-01-01T00:00:00.000Z',
		};
		const cairoRecordData = {
			recordId: '3',
			folder_linkId: 3,
			displayName: 'Cairo',
			updatedDT: '2024-01-01T00:00:00.000Z',
		};

		const buildFolderResponse = (folderData: FolderVOData) =>
			new FolderResponse({
				isSuccessful: true,
				Results: [{ data: [{ FolderVO: folderData }] }],
			});

		const namesOf = (folder: FolderVO) =>
			folder.ChildItemVOs.map((item) => item.displayName);

		let service: DataService;
		let getWithChildrenByIdentifier: jasmine.Spy;
		let folderUpdate: jasmine.Spy;
		let currentFolder: FolderVO;

		beforeEach(() => {
			service = TestBed.inject(DataService);
			const api = TestBed.inject(ApiService);
			getWithChildrenByIdentifier = spyOn(
				api.folder,
				'getWithChildrenByIdentifier',
			);
			folderUpdate = jasmine.createSpy('folderUpdate');
			service.folderUpdate.subscribe(folderUpdate);
			currentFolder = new FolderVO(
				{
					folderId: '10',
					folder_linkId: 100,
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [berlinFolderData, amsterdamRecordData],
				},
				true,
			);
			service.setCurrentFolder(currentFolder);
		});

		it('should fetch the current folder through getWithChildrenByIdentifier', async () => {
			getWithChildrenByIdentifier.and.resolveTo(
				buildFolderResponse({
					folderId: '10',
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [amsterdamRecordData, berlinFolderData],
				}),
			);

			await service.refreshCurrentFolder();

			expect(getWithChildrenByIdentifier).toHaveBeenCalledWith(currentFolder);
			expect(folderUpdate).toHaveBeenCalledWith(currentFolder);
		});

		it('should keep existing children by reference and merge their updated timestamp', async () => {
			const [berlin, amsterdam] = currentFolder.ChildItemVOs;
			getWithChildrenByIdentifier.and.resolveTo(
				buildFolderResponse({
					folderId: '10',
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [
						{ ...amsterdamRecordData, updatedDT: '2024-06-01T00:00:00.000Z' },
						berlinFolderData,
					],
				}),
			);

			await service.refreshCurrentFolder();

			expect(currentFolder.ChildItemVOs[0]).toBe(amsterdam);
			expect(currentFolder.ChildItemVOs[1]).toBe(berlin);
			expect(amsterdam.updatedDT).toBe('2024-06-01T00:00:00.000Z');
			expect(amsterdam.isNewlyCreated).toBeFalse();
		});

		it('should append children new since the last refresh in the server order and flag them', async () => {
			getWithChildrenByIdentifier.and.resolveTo(
				buildFolderResponse({
					folderId: '10',
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [
						amsterdamRecordData,
						berlinFolderData,
						cairoRecordData,
					],
				}),
			);

			await service.refreshCurrentFolder();

			expect(namesOf(currentFolder)).toEqual(['Amsterdam', 'Berlin', 'Cairo']);
			expect(currentFolder.ChildItemVOs[2].isNewlyCreated).toBeTrue();
			expect(currentFolder.ChildItemVOs[2].isRecord).toBeTrue();
		});

		it('should drop children the server no longer returns and deselect them', async () => {
			const [berlin, amsterdam] = currentFolder.ChildItemVOs;
			service.clickItemSingle(berlin);
			getWithChildrenByIdentifier.and.resolveTo(
				buildFolderResponse({
					folderId: '10',
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [amsterdamRecordData],
				}),
			);

			await service.refreshCurrentFolder();

			expect(currentFolder.ChildItemVOs).toEqual([amsterdam]);
			expect(service.getSelectedItems().has(berlin)).toBeFalse();
		});

		it('should match children whose link ids differ in type', async () => {
			const [berlin] = currentFolder.ChildItemVOs;
			getWithChildrenByIdentifier.and.resolveTo(
				buildFolderResponse({
					folderId: '10',
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [
						{ ...amsterdamRecordData, folder_linkId: '2' },
						{ ...berlinFolderData, folder_linkId: '1' },
					],
				}),
			);

			await service.refreshCurrentFolder();

			expect(currentFolder.ChildItemVOs[1]).toBe(berlin);
			expect(berlin.isNewlyCreated).toBeFalse();
		});

		it('should re-apply a previewed sort that is not saved on the folder yet', async () => {
			currentFolder.update({ sort: 'sort.alphabetical_desc' });
			getWithChildrenByIdentifier.and.resolveTo(
				buildFolderResponse({
					folderId: '10',
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [
						amsterdamRecordData,
						berlinFolderData,
						cairoRecordData,
					],
				}),
			);

			await service.refreshCurrentFolder();

			expect(namesOf(currentFolder)).toEqual(['Cairo', 'Berlin', 'Amsterdam']);
			expect(currentFolder.sort).toBe('sort.alphabetical_desc');
		});

		it('should keep the server order when the current sort is the saved one', async () => {
			getWithChildrenByIdentifier.and.resolveTo(
				buildFolderResponse({
					folderId: '10',
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [
						cairoRecordData,
						berlinFolderData,
						amsterdamRecordData,
					],
				}),
			);

			await service.refreshCurrentFolder();

			expect(namesOf(currentFolder)).toEqual(['Cairo', 'Berlin', 'Amsterdam']);
		});

		it('should reject with the raw error and leave the children alone when the fetch fails', async () => {
			const stelaError = new Error('stela is down');
			getWithChildrenByIdentifier.and.rejectWith(stelaError);

			await expectAsync(service.refreshCurrentFolder()).toBeRejectedWith(
				stelaError,
			);

			expect(namesOf(currentFolder)).toEqual(['Berlin', 'Amsterdam']);
			expect(folderUpdate).not.toHaveBeenCalled();
		});
	});

	describe('sortCurrentFolder', () => {
		it('should reorder the children in place, store the sort and announce the update', () => {
			const service = TestBed.inject(DataService);
			const currentFolder = new FolderVO(
				{
					folderId: '10',
					sort: 'sort.alphabetical_asc',
					ChildItemVOs: [
						{ recordId: '2', folder_linkId: 2, displayName: 'Amsterdam' },
						{ folderId: '1', folder_linkId: 1, displayName: 'Berlin' },
					],
				},
				true,
			);
			const [amsterdam, berlin] = currentFolder.ChildItemVOs;
			service.setCurrentFolder(currentFolder);
			const folderUpdate = jasmine.createSpy('folderUpdate');
			service.folderUpdate.subscribe(folderUpdate);

			service.sortCurrentFolder('sort.alphabetical_desc');

			expect(currentFolder.sort).toBe('sort.alphabetical_desc');
			expect(currentFolder.ChildItemVOs[0]).toBe(berlin);
			expect(currentFolder.ChildItemVOs[1]).toBe(amsterdam);
			expect(folderUpdate).toHaveBeenCalledWith(currentFolder);
		});
	});

	it('should add items to thumbRefreshQueue that meet the criteria', (done) => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve(new FolderResponse(getLeanItemsData)),
		);
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
	});

	it('should not add a lean item to thumbRefreshQueue when it has any thumbnail size', (done) => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		service.setCurrentFolder(currentFolder);

		const record = currentFolder.ChildItemVOs.find(
			(item) => item.isRecord,
		) as RecordVO;
		service.registerItem(record);

		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({
					ChildItemVOs: [
						{
							folder_linkId: record.folder_linkId,
							archiveNbr: record.archiveNbr,
							parentFolderId: currentFolder.folderId,
							thumbURL500: 'https://example.com/500',
						},
					],
				}),
			} as unknown as FolderResponse),
		);

		service
			.fetchLeanItems([record])
			.then(() => {
				expect(record.thumbURL500).toBe('https://example.com/500');
				expect(service.getThumbRefreshQueue()).not.toContain(record);
				done();
			})
			.catch(done.fail);
	});

	it('should announce the refreshed item when a thumbnail arrives', (done) => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		service.setCurrentFolder(currentFolder);

		const record = currentFolder.ChildItemVOs.find(
			(item) => item.isRecord,
		) as RecordVO;
		service.registerItem(record);

		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({
					ChildItemVOs: [
						{
							folder_linkId: record.folder_linkId,
							archiveNbr: record.archiveNbr,
							parentFolderId: currentFolder.folderId,
							thumbURL500: 'https://example.com/500',
						},
					],
				}),
			} as unknown as FolderResponse),
		);

		// The emitted reference is what lets a consumer tell its own item apart
		// from every other row's.
		service.thumbnailUpdated$().subscribe((updatedItem) => {
			expect(updatedItem).toBe(record);
			expect((updatedItem as RecordVO).thumbURL500).toBe(
				'https://example.com/500',
			);
			done();
		});

		service.fetchLeanItems([record]).catch(done.fail);
	});

	it('should not announce a refreshed item that still has no thumbnail', (done) => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		service.setCurrentFolder(currentFolder);

		const record = currentFolder.ChildItemVOs.find(
			(item) => item.isRecord,
		) as RecordVO;
		service.registerItem(record);

		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({
					ChildItemVOs: [
						{
							folder_linkId: record.folder_linkId,
							archiveNbr: record.archiveNbr,
							parentFolderId: currentFolder.folderId,
						},
					],
				}),
			} as unknown as FolderResponse),
		);

		const thumbnailUpdated = jasmine.createSpy();
		service.thumbnailUpdated$().subscribe(thumbnailUpdated);

		service
			.fetchLeanItems([record])
			.then(() => {
				expect(thumbnailUpdated).not.toHaveBeenCalled();
				expect(service.getThumbRefreshQueue()).toContain(record);
				done();
			})
			.catch(done.fail);
	});

	it('should update every child when the response is larger than the request', async () => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		service.setCurrentFolder(currentFolder);

		const allChildren = currentFolder.ChildItemVOs as (RecordVO | FolderVO)[];
		allChildren.forEach((item) => {
			service.registerItem(item);
		});

		// Ask about two items but answer with every child of the folder. This is
		// what stela's children endpoint does regardless of what was requested, so
		// the response cannot be matched to the request by position.
		const requested = allChildren.slice(0, 2);

		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({
					ChildItemVOs: allChildren.map((item) => ({
						folder_linkId: item.folder_linkId,
						archiveNbr: item.archiveNbr,
						parentFolderId: currentFolder.folderId,
						thumbURL500: `https://example.com/${item.folder_linkId}`,
					})),
				}),
			} as unknown as FolderResponse),
		);

		const count = await service.fetchLeanItems(requested);

		expect(count).toBe(allChildren.length);
		allChildren.forEach((item) => {
			expect(item.dataStatus).toEqual(DataStatus.Lean);
			expect(item.isFetching).toBeFalse();
			expect(item.thumbURL500).toBe(
				`https://example.com/${item.folder_linkId}`,
			);
		});
	});

	it('should settle a requested item that is absent from the response', async () => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		service.setCurrentFolder(currentFolder);

		const record = currentFolder.ChildItemVOs.find(
			(item) => item.isRecord,
		) as RecordVO;
		service.registerItem(record);

		// The record is no longer a child of the folder: it was moved or deleted
		// between the fetch being issued and the response arriving.
		const getWithChildren = spyOn(
			api.folder,
			'getWithChildren',
		).and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({ ChildItemVOs: [] }),
			} as unknown as FolderResponse),
		);

		const inFlight = service.fetchLeanItems([record]);
		const fetched = record.fetched;
		await inFlight;

		await expectAsync(fetched).toBeRejected();

		expect(record.isFetching).toBeFalse();
		expect(record.fetched).toBeNull();

		// A stuck isFetching flag would filter the record out of every later
		// fetch, leaving it permanently stale.
		getWithChildren.calls.reset();
		await service.fetchLeanItems([record]);

		expect(getWithChildren).toHaveBeenCalled();
	});

	it('should add a lean item to thumbRefreshQueue when the ids differ in type', (done) => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		service.setCurrentFolder(currentFolder);

		const record = currentFolder.ChildItemVOs.find(
			(item) => item.isRecord,
		) as RecordVO;
		service.registerItem(record);

		// The folder came from the PHP API, so its folderId is a number, while
		// stela reports the record's parentFolderId as a string.
		expect(typeof currentFolder.folderId).toBe('number');

		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({
					ChildItemVOs: [
						{
							folder_linkId: record.folder_linkId,
							archiveNbr: record.archiveNbr,
							parentFolderId: String(currentFolder.folderId),
						},
					],
				}),
			} as unknown as FolderResponse),
		);

		service
			.fetchLeanItems([record])
			.then(() => {
				expect(service.getThumbRefreshQueue()).toContain(record);
				done();
			})
			.catch(done.fail);
	});

	it('should not add a lean item to thumbRefreshQueue when it belongs to another folder', (done) => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		service.setCurrentFolder(currentFolder);

		const record = currentFolder.ChildItemVOs.find(
			(item) => item.isRecord,
		) as RecordVO;
		service.registerItem(record);

		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({
					ChildItemVOs: [
						{
							folder_linkId: record.folder_linkId,
							archiveNbr: record.archiveNbr,
							parentFolderId: `${currentFolder.folderId}0`,
						},
					],
				}),
			} as unknown as FolderResponse),
		);

		service
			.fetchLeanItems([record])
			.then(() => {
				expect(service.getThumbRefreshQueue()).not.toContain(record);
				done();
			})
			.catch(done.fail);
	});

	it('should add a lean item to thumbRefreshQueue when no thumbnail size is present', (done) => {
		const service = TestBed.inject(DataService);
		const api = TestBed.inject(ApiService);
		const navigateResponse = new FolderResponse(navigateMinData);
		const currentFolder = navigateResponse.getFolderVO(true) as FolderVO;
		service.setCurrentFolder(currentFolder);

		const record = currentFolder.ChildItemVOs.find(
			(item) => item.isRecord,
		) as RecordVO;
		service.registerItem(record);

		spyOn(api.folder, 'getWithChildren').and.returnValue(
			Promise.resolve({
				isSuccessful: true,
				getFolderVO: () => ({
					ChildItemVOs: [
						{
							folder_linkId: record.folder_linkId,
							archiveNbr: record.archiveNbr,
							parentFolderId: currentFolder.folderId,
						},
					],
				}),
			} as unknown as FolderResponse),
		);

		service
			.fetchLeanItems([record])
			.then(() => {
				expect(service.getThumbRefreshQueue()).toContain(record);
				done();
			})
			.catch(done.fail);
	});
});
