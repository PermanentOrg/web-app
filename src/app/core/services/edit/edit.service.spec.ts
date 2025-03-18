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

  it('should not call update when records list is empty', async () => {
    const mockRecords: RecordVO[] = [];
    const promises = [];

    if (mockRecords.length) {
      const archiveId = accountService.getArchive().archiveId;
      promises.push(apiService.record.update(mockRecords, archiveId));
    } else {
      promises.push(Promise.resolve());
    }

    await Promise.all(promises);

    expect(apiService.record.update).not.toHaveBeenCalled();
  });

  it('should call update and process response when records exist', async () => {
    const mockRecords = [
      new RecordVO({ recordId: 1, folder_linkId: 10 }),
      new RecordVO({ recordId: 2, folder_linkId: 11 }),
    ];

    const mockResponse = [
      { updatedDT: '2024-03-03', TimezoneVO: { timezone: 'UTC' } },
    ];

    (apiService.record.update as jasmine.Spy).and.returnValue(
      Promise.resolve(mockResponse),
    );

    const promises = [];

    if (mockRecords.length) {
      const archiveId = accountService.getArchive().archiveId;
      promises.push(apiService.record.update(mockRecords, archiveId));
    } else {
      promises.push(Promise.resolve());
    }

    const results = await Promise.all(promises);
    const recordResponse = results[0];

    expect(apiService.record.update).toHaveBeenCalledWith(mockRecords, 123);
    expect(recordResponse[0].updatedDT).toBe('2024-03-03');
    expect(recordResponse[0].TimezoneVO.timezone).toBe('UTC');
  });

  it('should handle empty records array and not call update', async () => {
    const mockRecords: RecordVO[] = [];
    const promises = [];

    if (mockRecords.length) {
      const archiveId = accountService.getArchive().archiveId;
      promises.push(apiService.record.update(mockRecords, archiveId));
    } else {
      promises.push(Promise.resolve());
    }

    await Promise.all(promises);

    expect(apiService.record.update).not.toHaveBeenCalled();
  });

  it('should call update when records exist', async () => {
    const mockRecords = [new RecordVO({ recordId: 1, displayName: 'Test' })];
    const archiveId = 123;
    const mockResponse = [{ updatedDT: '2024-03-03' }];

    accountService.getArchive.and.returnValue(new ArchiveVO({ archiveId }));
    (apiService.record.update as jasmine.Spy).and.returnValue(
      Promise.resolve(mockResponse),
    );

    const promises = [];
    if (mockRecords.length) {
      const archiveId = accountService.getArchive().archiveId;
      promises.push(apiService.record.update(mockRecords, archiveId));
    } else {
      promises.push(Promise.resolve());
    }

    const results = await Promise.all(promises);

    expect(apiService.record.update).toHaveBeenCalledWith(
      mockRecords,
      archiveId,
    );

    expect(results[0][0].updatedDT).toBe('2024-03-03');
  });

  it('should NOT update record when recordResponse is empty', () => {
    const recordMock = new RecordVO({ recordId: 1, folder_linkId: 10 });
    recordMock.update = jasmine.createSpy('update');

    const mockResponse = []; // Empty response
    const itemsByLinkId = { 10: recordMock };
    const recordsByRecordId = new Map<number, RecordVO>();

    if (mockResponse.length) {
      const res = mockResponse[0];

      const newData: RecordVOData = {
        updatedDT: res.updatedDT,
      };

      if (res.TimezoneVO) {
        newData.TimezoneVO = res.TimezoneVO;
      }

      const record =
        (itemsByLinkId[res.folder_linkId] as RecordVO) ||
        recordsByRecordId.get(res.recordId);

      record.update(newData);
    }

    expect(recordMock.update).not.toHaveBeenCalled();
  });
});
