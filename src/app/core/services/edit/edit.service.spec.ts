import { TestBed, inject } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { EditService } from '@core/services/edit/edit.service';
import { ApiService } from '@shared/services/api/api.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ArchiveVO, FolderVO, RecordVO, RecordVOData } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { RecordRepo } from '@shared/services/api/record.repo';
import { MessageService } from '@shared/services/message/message.service';
import { DataService } from '@shared/services/data/data.service';
import { FolderPickerService } from '../folder-picker/folder-picker.service';

const mockDataService = {
	refreshCurrentFolder: () => Promise.resolve(),
	downloadFile: () => Promise.resolve(),
	hideItemsInCurrentFolder: (items) => {},
	itemUnshared: (item) => {},
};

describe('EditService', () => {
	let service: EditService;
	let apiService: jasmine.SpyObj<ApiService>;
	let messageSent = false;

	let accountService: jasmine.SpyObj<AccountService>;
	beforeEach(() => {
		apiService = jasmine.createSpyObj('ApiService', ['record']);
		apiService.record = {
			update: jasmine.createSpy('update'),
		} as unknown as RecordRepo;

		accountService = jasmine.createSpyObj('AccountService', ['getArchive']);
		accountService.getArchive.and.returnValue(
			new ArchiveVO({ archiveId: 123 }),
		);
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
			],
		});

		service = TestBed.inject(EditService);
	});

	it('should be created', inject([EditService], (service: EditService) => {
		expect(service).toBeTruthy();
	}));

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
});
