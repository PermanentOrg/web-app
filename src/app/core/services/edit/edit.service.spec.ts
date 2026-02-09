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
			getRecordShareLink: jasmine.createSpy('getRecordShareLink'),
		} as unknown as RecordRepo;
		apiService.folder = {
			getFolderShareLink: jasmine.createSpy('getFolderShareLink'),
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
		(apiService.record.update as jasmine.Spy).and.returnValue(
			Promise.resolve([{ updatedDT: '2024-03-03' }]),
		);
		await service.updateItems(mockRecords);

		expect(apiService.record.update).toHaveBeenCalledWith(mockRecords, 123);
		expect(record.updatedDT).toBe('2024-03-03');
	});

	it('should handle empty records array and not call update', async () => {
		const mockRecords: RecordVO[] = [];

		await service.updateItems(mockRecords);

		expect(apiService.record.update).not.toHaveBeenCalled();
	});

	it('should NOT update record when recordResponse is empty', async () => {
		const recordMock = new RecordVO({ recordId: 1, folder_linkId: 10 });
		recordMock.update = jasmine.createSpy('update');

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
});
