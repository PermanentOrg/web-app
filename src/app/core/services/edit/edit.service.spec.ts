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

import { vi } from 'vitest';

const mockDataService = {
	refreshCurrentFolder: async () => await Promise.resolve(),
	downloadFile: async () => await Promise.resolve(),
	hideItemsInCurrentFolder: (items) => {},
	itemUnshared: (item) => {},
};

describe('EditService', () => {
	let service: EditService;
	let apiService: any;
	let accountService: any;
	let shareLinksApiService: any;
	let deviceService: any;
	let dialogService: any;

	beforeEach(() => {
		apiService = { record: vi.fn(), folder: vi.fn(), share: vi.fn() } as any;
		apiService.record = {
			update: vi.fn(),
			updateStelaRecord: vi.fn(),
			get: vi.fn(),
			getRecordShareLink: vi.fn(),
		} as unknown as RecordRepo;
		apiService.folder = {
			getFolderShareLink: vi.fn(),
		} as unknown as FolderRepo;
		apiService.share = {
			getShareLink: vi.fn(),
		} as any;

		accountService = { getArchive: vi.fn() } as any;
		accountService.getArchive.mockReturnValue(
			new ArchiveVO({ archiveId: 123 }),
		);

		shareLinksApiService = { generateShareLink: vi.fn(), getShareLinksById: vi.fn(), updateShareLink: vi.fn(), deleteShareLink: vi.fn() } as any;

		deviceService = { isMobile: vi.fn() } as any;
		dialogService = { open: vi.fn() } as any;

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
		(apiService.record.update as any).mockReturnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		(apiService.record.get as any).mockReturnValue(
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

	it('should call updateStelaRecord when recordKey is displayDT', async () => {
		const record = new RecordVO({ recordId: 1, displayDT: '2024-01-01' });
		const updatedRecord = new RecordVO({
			recordId: 1,
			updatedDT: '2024-03-03',
			displayTime: '2024-01-01',
		});
		const mockResponse = {
			getRecordVO: () => updatedRecord,
			getRecordVOs: () => [updatedRecord],
		};
		(apiService.record.updateStelaRecord as any).mockReturnValue(
			Promise.resolve(mockResponse),
		);
		(apiService.record.update as any).mockReturnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		(apiService.record.get as any).mockReturnValue(
			Promise.resolve(mockResponse),
		);

		await service.updateItems([record], ['displayDT']);

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
		(apiService.record.update as any).mockReturnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		(apiService.record.get as any).mockReturnValue(
			Promise.resolve(mockResponse),
		);

		await service.updateItems([record], ['displayName']);

		expect(apiService.record.updateStelaRecord).not.toHaveBeenCalled();
		expect(apiService.record.update).toHaveBeenCalled();
		expect(apiService.record.get).toHaveBeenCalledWith([record]);
	});

	it('should call both updateStelaRecord and update when recordKey has displayDT with other properties', async () => {
		const record = new RecordVO({
			recordId: 1,
			displayDT: '2024-01-01',
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
		(apiService.record.updateStelaRecord as any).mockReturnValue(
			Promise.resolve(mockResponse),
		);
		(apiService.record.update as any).mockReturnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		(apiService.record.get as any).mockReturnValue(
			Promise.resolve(mockResponse),
		);

		await service.updateItems([record], ['displayDT', 'displayName']);

		expect(apiService.record.updateStelaRecord).toHaveBeenCalledWith(record);
		expect(apiService.record.update).toHaveBeenCalled();
		expect(apiService.record.get).toHaveBeenCalledWith([record]);
	});

	it('should NOT update record when recordResponse is empty', async () => {
		const recordMock = new RecordVO({ recordId: 1, folder_linkId: 10 });
		recordMock.update = vi.fn();
		const mockResponse = {
			getRecordVOs: () => [],
		};
		(apiService.record.get as any).mockReturnValue(
			Promise.resolve(mockResponse),
		);

		await service.updateItems([recordMock]);

		expect(apiService.record.update).toHaveBeenCalled();
		expect(recordMock.update).not.toHaveBeenCalled();
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
				deviceService.isMobile.mockReturnValue(false);
			});

			it('should open SharingDialogComponent for a record', async () => {
				const record = new RecordVO({ recordId: 123 });
				(apiService.record.getRecordShareLink as any).mockResolvedValue([
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
				(apiService.folder.getFolderShareLink as any).mockResolvedValue([
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
				(apiService.record.getRecordShareLink as any).mockResolvedValue([]);

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
				(apiService.record.getRecordShareLink as any).mockRejectedValue(
					new Error('API error'),
				);

				await service.openShareDialog(record);

				expect(dialogService.open).not.toHaveBeenCalled();
			});
		});

		describe('mobile', () => {
			beforeEach(() => {
				deviceService.isMobile.mockReturnValue(true);
			});

			it('should open SharingComponent for a record', async () => {
				const record = new RecordVO({ recordId: 123 });
				const mockShareByUrlVO = { shareby_urlId: 123 };
				const mockResponse = {
					getShareByUrlVO: () => mockShareByUrlVO,
				};

				(apiService.share.getShareLink as any).mockResolvedValue(
					mockResponse,
				);
				shareLinksApiService.getShareLinksById.mockResolvedValue([mockShareLink]);

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
				(apiService.share.getShareLink as any).mockRejectedValue(
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

				(apiService.share.getShareLink as any).mockResolvedValue(
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
		(apiService as any).record.delete = vi.fn()
			.mockReturnValue(Promise.resolve());
		accountService.refreshAccountDebounced = Object.assign(
			vi.fn(),
			{
				cancel: vi.fn(),
				flush: vi.fn(),
			},
		) as any;
		(mockDataService as any).refreshCurrentFolder = vi.fn();

		await service.deleteItems([record]);

		expect(accountService.refreshAccountDebounced).toHaveBeenCalled();
		expect(mockDataService.refreshCurrentFolder).toHaveBeenCalled();
	});

	it('should call refreshAccountDebounced and refreshCurrentFolder even when deletion fails', async () => {
		const record = new RecordVO({ recordId: 1 });
		(apiService as any).record.delete = vi.fn()
			.mockReturnValue(Promise.reject(new Error('API error')));
		accountService.refreshAccountDebounced = Object.assign(
			vi.fn(),
			{
				cancel: vi.fn(),
				flush: vi.fn(),
			},
		) as any;
		(mockDataService as any).refreshCurrentFolder = vi.fn();

		try {
			await service.deleteItems([record]);
		} catch (e) {
			// the try will fail, because we are testing the finally block
		}

		expect(accountService.refreshAccountDebounced).toHaveBeenCalled();
		expect(mockDataService.refreshCurrentFolder).toHaveBeenCalled();
	});
});
