import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { EditService } from '@core/services/edit/edit.service';
import { ApiService } from '@shared/services/api/api.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ArchiveVO, FolderVO, RecordVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { RecordRepo } from '@shared/services/api/record.repo';
import { FolderRepo } from '@shared/services/api/folder.repo';
import { MessageService } from '@shared/services/message/message.service';
import { DataService } from '@shared/services/data/data.service';
import { ShareLinksApiService } from '@root/app/share-links/services/share-links-api.service';
import { ShareLink } from '@root/app/share-links/models/share-link';
import { DeviceService } from '@shared/services/device/device.service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { SharingComponent } from '@fileBrowser/components/sharing/sharing.component';
import { SharingDialogComponent } from '@fileBrowser/components/sharing-dialog/sharing-dialog.component';
import { FolderPickerService } from '../folder-picker/folder-picker.service';

const mockDataService = {
	refreshCurrentFolder: async () => await Promise.resolve(),
	downloadFile: async () => await Promise.resolve(),
	hideItemsInCurrentFolder: (items) => {},
	itemUnshared: (item) => {},
};

describe('EditService', () => {
	let service: EditService;
	let apiService: jasmine.SpyObj<ApiService>;
	let accountService: jasmine.SpyObj<AccountService>;
	let shareLinksApiService: jasmine.SpyObj<ShareLinksApiService>;
	let deviceService: jasmine.SpyObj<DeviceService>;
	let dialogService: jasmine.SpyObj<DialogCdkService>;

	beforeEach(() => {
		apiService = jasmine.createSpyObj('ApiService', [
			'record',
			'folder',
			'share',
		]);
		apiService.record = {
			update: jasmine.createSpy('update'),
			updateStelaRecord: jasmine.createSpy('updateStelaRecord'),
			get: jasmine.createSpy('get'),
			getRecordShareLink: jasmine.createSpy('getRecordShareLink'),
		} as unknown as RecordRepo;
		apiService.folder = {
			getFolderShareLink: jasmine.createSpy('getFolderShareLink'),
			update: jasmine.createSpy('update'),
			updateStelaFolder: jasmine.createSpy('updateStelaFolder'),
			getStelaFolderVOs: jasmine.createSpy('getStelaFolderVOs'),
		} as unknown as FolderRepo;
		apiService.share = {
			getShareLink: jasmine.createSpy('getShareLink'),
		} as any;

		accountService = jasmine.createSpyObj('AccountService', ['getArchive']);
		accountService.getArchive.and.returnValue(
			new ArchiveVO({ archiveId: 123 }),
		);

		shareLinksApiService = jasmine.createSpyObj('ShareLinksApiService', [
			'generateShareLink',
			'getShareLinksById',
			'updateShareLink',
			'deleteShareLink',
		]);

		deviceService = jasmine.createSpyObj('DeviceService', ['isMobile']);
		dialogService = jasmine.createSpyObj('DialogCdkService', ['open']);

		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.imports.push(NgbTooltipModule);
		TestBed.configureTestingModule({
			providers: [
				EditService,
				MessageService,
				FolderPickerService,
				{ provide: DataService, useValue: mockDataService },
				{ provide: ApiService, useValue: apiService },
				{ provide: AccountService, useValue: accountService },
				{ provide: ShareLinksApiService, useValue: shareLinksApiService },
				{ provide: DeviceService, useValue: deviceService },
				{ provide: DialogCdkService, useValue: dialogService },
			],
		});

		service = TestBed.inject(EditService);
	});

	it('should be created', () => {
		const service = TestBed.inject(EditService);

		expect(service).toBeTruthy();
	});

	it('should call update when there are records', async () => {
		const record = new RecordVO({ recordId: 1, displayName: 'Test' });
		const mockRecords = [record];
		const updatedRecord = new RecordVO({
			recordId: 1,
			updatedDT: '2024-03-03',
		});
		const mockResponse = {
			getRecordVOs: () => [updatedRecord],
		};
		(apiService.record.update as jasmine.Spy).and.returnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		(apiService.record.get as jasmine.Spy).and.returnValue(
			Promise.resolve(mockResponse),
		);
		await service.updateItems(mockRecords);

		expect(apiService.record.update).toHaveBeenCalledWith(mockRecords, 123);
		expect(apiService.record.get).toHaveBeenCalledWith(mockRecords);
	});

	it('should handle empty records array and not call update', async () => {
		const mockRecords: RecordVO[] = [];

		await service.updateItems(mockRecords);

		expect(apiService.record.update).not.toHaveBeenCalled();
	});

	it('should call updateStelaRecord when recordKey is displayTime', async () => {
		const record = new RecordVO({ recordId: 1, displayTime: '2024-01-01' });
		const updatedRecord = new RecordVO({
			recordId: 1,
			updatedDT: '2024-03-03',
			displayTime: '2024-01-01',
		});
		const mockResponse = {
			getRecordVO: () => updatedRecord,
			getRecordVOs: () => [updatedRecord],
		};
		(apiService.record.updateStelaRecord as jasmine.Spy).and.returnValue(
			Promise.resolve(mockResponse),
		);
		(apiService.record.update as jasmine.Spy).and.returnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		(apiService.record.get as jasmine.Spy).and.returnValue(
			Promise.resolve(mockResponse),
		);

		await service.updateItems([record], ['displayTime']);

		expect(apiService.record.updateStelaRecord).toHaveBeenCalledWith(record);
		expect(apiService.record.update).toHaveBeenCalled();
		expect(apiService.record.get).toHaveBeenCalledWith([record]);
	});

	it('should not call updateStelaRecord when recordKey does not contain displayDT', async () => {
		const record = new RecordVO({ recordId: 1, displayName: 'Test' });
		const updatedRecord = new RecordVO({
			recordId: 1,
			updatedDT: '2024-03-03',
		});
		const mockResponse = {
			getRecordVOs: () => [updatedRecord],
		};
		(apiService.record.update as jasmine.Spy).and.returnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		(apiService.record.get as jasmine.Spy).and.returnValue(
			Promise.resolve(mockResponse),
		);

		await service.updateItems([record], ['displayName']);

		expect(apiService.record.updateStelaRecord).not.toHaveBeenCalled();
		expect(apiService.record.update).toHaveBeenCalled();
		expect(apiService.record.get).toHaveBeenCalledWith([record]);
	});

	it('should call both updateStelaRecord and update when recordKey has displayTime with other properties', async () => {
		const record = new RecordVO({
			recordId: 1,
			displayTime: '2024-01-01',
			displayName: 'Test',
		});
		const updatedRecord = new RecordVO({
			recordId: 1,
			updatedDT: '2024-03-03',
			displayTime: '2024-01-01',
		});
		const mockResponse = {
			getRecordVOs: () => [updatedRecord],
		};
		(apiService.record.updateStelaRecord as jasmine.Spy).and.returnValue(
			Promise.resolve(mockResponse),
		);
		(apiService.record.update as jasmine.Spy).and.returnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		(apiService.record.get as jasmine.Spy).and.returnValue(
			Promise.resolve(mockResponse),
		);

		await service.updateItems([record], ['displayTime', 'displayName']);

		expect(apiService.record.updateStelaRecord).toHaveBeenCalledWith(record);
		expect(apiService.record.update).toHaveBeenCalled();
		expect(apiService.record.get).toHaveBeenCalledWith([record]);
	});

	it('should NOT update record when recordResponse is empty', async () => {
		const recordMock = new RecordVO({ recordId: 1, folder_linkId: 10 });
		recordMock.update = jasmine.createSpy('update');
		const mockResponse = {
			getRecordVOs: () => [],
		};
		(apiService.record.get as jasmine.Spy).and.returnValue(
			Promise.resolve(mockResponse),
		);

		await service.updateItems([recordMock]);

		expect(apiService.record.update).toHaveBeenCalled();
		expect(recordMock.update).not.toHaveBeenCalled();
	});

	it('should call folder.update and getStelaFolderVOs when updating folders', async () => {
		const folder = new FolderVO({ folderId: 1, displayName: 'Test Folder' });
		const mockFolders = [folder];
		const mockFolderResponse = {
			getFolderVOs: jasmine
				.createSpy('getFolderVOs')
				.and.returnValue([
					new FolderVO({ folderId: 1, updatedDT: '2024-03-03' }),
				]),
		};

		(apiService.folder.update as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);
		(apiService.folder.getStelaFolderVOs as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);

		await service.updateItems(mockFolders);

		expect(apiService.folder.update).toHaveBeenCalledWith(
			mockFolders,
			undefined,
		);

		expect(apiService.folder.getStelaFolderVOs).toHaveBeenCalledWith(
			mockFolders,
		);

		expect(apiService.folder.updateStelaFolder).not.toHaveBeenCalled();
	});

	it('should update folder with displayTime from server response', async () => {
		const folder = new FolderVO({
			folderId: 1,
			folder_linkId: 100,
			displayName: 'Test Folder',
		});
		const mockFolders = [folder];
		const updatedFolderVO = new FolderVO({
			folderId: 1,
			folder_linkId: 100,
			updatedDT: '2024-03-03',
			displayDT: '1985-05-20',
			displayEndDT: '1990-06-15',
			displayTime: '1985-05-20/1990-06-15',
		});

		const mockFolderResponse = {
			getFolderVOs: jasmine
				.createSpy('getFolderVOs')
				.and.returnValue([updatedFolderVO]),
		};

		(apiService.folder.update as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);
		(apiService.folder.getStelaFolderVOs as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);

		folder.update = jasmine.createSpy('update');

		await service.updateItems(mockFolders);

		expect(folder.update).toHaveBeenCalledWith(
			jasmine.objectContaining({
				updatedDT: '2024-03-03',
				displayTime: '1985-05-20/1990-06-15',
				displayDT: '1985-05-20T00:00:00.000Z',
				displayEndDT: '1990-06-15T00:00:00.000Z',
			}),
		);
	});

	it('should update folder with displayDT and displayEndDT when present in response', async () => {
		const folder = new FolderVO({
			folderId: 1,
			folder_linkId: 100,
			displayName: 'Test Folder',
		});
		const mockFolders = [folder];
		const updatedFolderVO = new FolderVO({
			folderId: 1,
			folder_linkId: 100,
			updatedDT: '2024-03-03',
			displayDT: '1985-05-20',
			displayEndDT: '1990-06-15',
		});

		const mockFolderResponse = {
			getFolderVOs: jasmine
				.createSpy('getFolderVOs')
				.and.returnValue([updatedFolderVO]),
		};

		(apiService.folder.update as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);
		(apiService.folder.getStelaFolderVOs as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);

		folder.update = jasmine.createSpy('update');

		await service.updateItems(mockFolders);

		expect(folder.update).toHaveBeenCalledWith(
			jasmine.objectContaining({
				displayDT: '1985-05-20T00:00:00.000Z',
				displayEndDT: '1990-06-15T00:00:00.000Z',
			}),
		);
	});

	it('should call updateStelaFolder when whitelist contains displayTime', async () => {
		const folder = new FolderVO({
			folderId: 1,
			displayTime: '1985-05-20T00:00:00+00:00',
		});
		const mockFolders = [folder];
		const mockFolderResponse = {
			getFolderVOs: jasmine
				.createSpy('getFolderVOs')
				.and.returnValue([
					new FolderVO({ folderId: 1, updatedDT: '2024-03-03' }),
				]),
		};

		(apiService.folder.updateStelaFolder as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);
		(apiService.folder.update as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);
		(apiService.folder.getStelaFolderVOs as jasmine.Spy).and.returnValue(
			Promise.resolve(mockFolderResponse),
		);

		await service.updateItems(mockFolders, ['displayTime']);

		expect(apiService.folder.updateStelaFolder).toHaveBeenCalledWith(folder);
		expect(apiService.folder.update).toHaveBeenCalledWith(mockFolders, [
			'displayTime',
		]);

		expect(apiService.folder.getStelaFolderVOs).toHaveBeenCalledWith(
			mockFolders,
		);
	});

	it('should handle empty folders array and not call folder methods', async () => {
		const mockFolders: FolderVO[] = [];

		await service.updateItems(mockFolders);

		expect(apiService.folder.update).not.toHaveBeenCalled();
		expect(apiService.folder.updateStelaFolder).not.toHaveBeenCalled();
		expect(apiService.folder.getStelaFolderVOs).not.toHaveBeenCalled();
	});

	it('should revert property and show error when updateStelaRecord fails', async () => {
		const messageService = TestBed.inject(MessageService);
		spyOn(messageService, 'showError');

		const record = new RecordVO({ recordId: 1, displayTime: 'original-value' });
		const httpError = {
			error: { message: 'Invalid date format' },
			message: 'Http failure',
		};

		(apiService.record.updateStelaRecord as jasmine.Spy).and.returnValue(
			Promise.reject(httpError),
		);
		(apiService.record.update as jasmine.Spy).and.returnValue(
			Promise.resolve([]),
		);

		await service.saveItemVoProperty(record, 'displayTime', 'new-value');

		expect(record.displayTime).toBe('original-value');
		expect(messageService.showError).toHaveBeenCalledWith({
			message: 'Invalid date format',
		});
	});

	it('should show fallback error when updateStelaRecord fails without error body', async () => {
		const messageService = TestBed.inject(MessageService);
		spyOn(messageService, 'showError');

		const record = new RecordVO({ recordId: 1, displayTime: 'original-value' });

		(apiService.record.updateStelaRecord as jasmine.Spy).and.returnValue(
			Promise.reject({}),
		);
		(apiService.record.update as jasmine.Spy).and.returnValue(
			Promise.resolve([]),
		);

		await service.saveItemVoProperty(record, 'displayTime', 'new-value');

		expect(record.displayTime).toBe('original-value');
		expect(messageService.showError).toHaveBeenCalledWith({
			message: 'Failed to save changes',
		});
	});

	it('should revert property and show error when updateStelaFolder fails', async () => {
		const messageService = TestBed.inject(MessageService);
		spyOn(messageService, 'showError');

		const folder = new FolderVO({ folderId: 1, displayTime: 'original-value' });
		const httpError = { error: { error: 'Invalid EDTF string' } };

		(apiService.folder.updateStelaFolder as jasmine.Spy).and.returnValue(
			Promise.reject(httpError),
		);
		(apiService.folder.update as jasmine.Spy).and.returnValue(
			Promise.resolve({}),
		);
		(apiService.folder.getStelaFolderVOs as jasmine.Spy).and.returnValue(
			Promise.resolve({ getFolderVOs: () => [] }),
		);

		await service.saveItemVoProperty(folder, 'displayTime', 'new-value');

		expect(folder.displayTime).toBe('original-value');
		expect(messageService.showError).toHaveBeenCalledWith({
			message: 'Invalid EDTF string',
		});
	});

	describe('openShareDialog', () => {
		const mockShareLink: ShareLink = {
			id: 'link1',
			itemId: '123',
			itemType: 'record',
			token: 'abc',
			permissionsLevel: 'viewer',
			accessRestrictions: 'none',
			maxUses: null,
			usesExpended: null,
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-01'),
		};

		describe('desktop', () => {
			beforeEach(() => {
				deviceService.isMobile.and.returnValue(false);
			});

			it('should open SharingDialogComponent for a record', async () => {
				const record = new RecordVO({ recordId: 123 });
				(apiService.record.getRecordShareLink as jasmine.Spy).and.resolveTo([
					mockShareLink,
				]);

				await service.openShareDialog(record);

				expect(apiService.record.getRecordShareLink).toHaveBeenCalledWith(
					record,
				);

				expect(dialogService.open).toHaveBeenCalledWith(
					SharingDialogComponent,
					{
						data: {
							item: record,
							newShare: mockShareLink,
						},
						width: '600px',
						panelClass: 'dialog',
					},
				);
			});

			it('should open SharingDialogComponent for a folder', async () => {
				const folder = new FolderVO({ folderId: 456 });
				(apiService.folder.getFolderShareLink as jasmine.Spy).and.resolveTo([
					mockShareLink,
				]);

				await service.openShareDialog(folder);

				expect(apiService.folder.getFolderShareLink).toHaveBeenCalledWith(
					folder,
				);

				expect(dialogService.open).toHaveBeenCalledWith(
					SharingDialogComponent,
					{
						data: {
							item: folder,
							newShare: mockShareLink,
						},
						width: '600px',
						panelClass: 'dialog',
					},
				);
			});

			it('should pass undefined as newShare when no share links exist', async () => {
				const record = new RecordVO({ recordId: 123 });
				(apiService.record.getRecordShareLink as jasmine.Spy).and.resolveTo([]);

				await service.openShareDialog(record);

				expect(dialogService.open).toHaveBeenCalledWith(
					SharingDialogComponent,
					{
						data: {
							item: record,
							newShare: undefined,
						},
						width: '600px',
						panelClass: 'dialog',
					},
				);
			});

			it('should not open dialog when getShareLinkByItemId throws an error', async () => {
				const record = new RecordVO({ recordId: 123 });
				(apiService.record.getRecordShareLink as jasmine.Spy).and.rejectWith(
					new Error('API error'),
				);

				await service.openShareDialog(record);

				expect(dialogService.open).not.toHaveBeenCalled();
			});
		});

		describe('mobile', () => {
			beforeEach(() => {
				deviceService.isMobile.and.returnValue(true);
			});

			it('should open SharingComponent for a record', async () => {
				const record = new RecordVO({ recordId: 123 });
				const mockShareByUrlVO = { shareby_urlId: 123 };
				const mockResponse = {
					getShareByUrlVO: () => mockShareByUrlVO,
				};

				(apiService.share.getShareLink as jasmine.Spy).and.resolveTo(
					mockResponse,
				);
				shareLinksApiService.getShareLinksById.and.resolveTo([mockShareLink]);

				await service.openShareDialog(record);

				expect(apiService.share.getShareLink).toHaveBeenCalledWith(record);
				expect(shareLinksApiService.getShareLinksById).toHaveBeenCalledWith([
					123,
				]);

				expect(dialogService.open).toHaveBeenCalledWith(SharingComponent, {
					panelClass: 'dialog',
					data: {
						item: record,
						link: mockShareByUrlVO,
						newShare: mockShareLink,
					},
				});
			});

			it('should not open dialog when getShareLink throws an error', async () => {
				const record = new RecordVO({ recordId: 123 });
				(apiService.share.getShareLink as jasmine.Spy).and.rejectWith(
					new Error('API error'),
				);

				await service.openShareDialog(record);

				expect(dialogService.open).not.toHaveBeenCalled();
			});

			it('should pass undefined as newShare when getShareByUrlVO returns null', async () => {
				const record = new RecordVO({ recordId: 123 });
				const mockResponse = {
					getShareByUrlVO: () => null,
				};

				(apiService.share.getShareLink as jasmine.Spy).and.resolveTo(
					mockResponse,
				);

				await service.openShareDialog(record);

				expect(shareLinksApiService.getShareLinksById).not.toHaveBeenCalled();
				expect(dialogService.open).toHaveBeenCalledWith(SharingComponent, {
					panelClass: 'dialog',
					data: {
						item: record,
						link: null,
						newShare: undefined,
					},
				});
			});
		});
	});

	it('should call refreshAccountDebounced and refreshCurrentFolder after successful deletion', async () => {
		const record = new RecordVO({ recordId: 1 });
		(apiService as any).record.delete = jasmine
			.createSpy('delete')
			.and.returnValue(Promise.resolve());
		accountService.refreshAccountDebounced = Object.assign(
			jasmine.createSpy('refreshAccountDebounced'),
			{
				cancel: jasmine.createSpy('cancel'),
				flush: jasmine.createSpy('flush'),
			},
		) as any;
		(mockDataService as any).refreshCurrentFolder = jasmine.createSpy(
			'refreshCurrentFolder',
		);

		await service.deleteItems([record]);

		expect(accountService.refreshAccountDebounced).toHaveBeenCalled();
		expect(mockDataService.refreshCurrentFolder).toHaveBeenCalled();
	});

	it('should call refreshAccountDebounced and refreshCurrentFolder even when deletion fails', async () => {
		const record = new RecordVO({ recordId: 1 });
		(apiService as any).record.delete = jasmine
			.createSpy('delete')
			.and.returnValue(Promise.reject(new Error('API error')));
		accountService.refreshAccountDebounced = Object.assign(
			jasmine.createSpy('refreshAccountDebounced'),
			{
				cancel: jasmine.createSpy('cancel'),
				flush: jasmine.createSpy('flush'),
			},
		) as any;
		(mockDataService as any).refreshCurrentFolder = jasmine.createSpy(
			'refreshCurrentFolder',
		);

		try {
			await service.deleteItems([record]);
		} catch (e) {
			// the try will fail, because we are testing the finally block
		}

		expect(accountService.refreshAccountDebounced).toHaveBeenCalled();
		expect(mockDataService.refreshCurrentFolder).toHaveBeenCalled();
	});
});
