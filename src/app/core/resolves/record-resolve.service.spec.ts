/* @format */
import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';

import { RecordResolveService } from '@core/resolves/record-resolve.service';
import { DataService } from '@shared/services/data/data.service';
import { RecordVO } from '@models/index';
import { DataStatus } from '@models/data-status.enum';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { RecordResponse } from '@shared/services/api/record.repo';
import { MessageService } from '@shared/services/message/message.service';

describe('RecordResolveService', () => {
  let service: RecordResolveService;
  let data: DataService;
  let route: ActivatedRoute;
  let api: ApiService;
  let message: MessageService;

  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const providers = config.providers;
    providers.push(RecordResolveService);
    providers.push(DataService);
    providers.push({
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          params: { recArchiveNbr: '1234-abcd' },
        },
      },
    });
    providers.push(MessageService);
    providers.push(ApiService);
    TestBed.configureTestingModule(config);
    service = TestBed.inject(RecordResolveService);
    data = TestBed.inject(DataService);
    route = TestBed.inject(ActivatedRoute);
    api = TestBed.inject(ApiService);
    message = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a record that is fully cached by dataservice', async () => {
    const record = new RecordVO(
      { displayName: 'Test Record', archiveNbr: '1234-abcd' },
      { dataStatus: DataStatus.Full }
    );
    const spy = spyOn(data, 'getItemByArchiveNbr').and.returnValue(record);
    const fetchSpy = spyOn(data, 'fetchFullItems');
    const result = await service.resolve(route.snapshot, null);

    expect(result).toEqual(record);
    expect(spy).toHaveBeenCalledWith('1234-abcd');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should fetch a lean record that is cached by dataservice', async () => {
    const record = new RecordVO(
      { displayName: 'Test Record', archiveNbr: '1234-abcd' },
      { dataStatus: DataStatus.Lean }
    );
    const spy = spyOn(data, 'getItemByArchiveNbr').and.returnValue(record);
    spyOn(data, 'fetchFullItems').and.callFake(async () => {
      record.displayName = 'Fetched Record';
      record.dataStatus = DataStatus.Full;
      return true;
    });
    const result = await service.resolve(route.snapshot, null);

    expect(result.displayName).toBe('Fetched Record');
    expect(result.dataStatus).toBe(DataStatus.Full);
    expect(spy).toHaveBeenCalledWith('1234-abcd');
  });

  it('should call record/get if a record is not cached', async () => {
    spyOn(data, 'getItemByArchiveNbr').and.returnValue(undefined);
    const apiSpy = spyOn(api.record, 'get').and.resolveTo(
      new RecordResponse({
        isSuccessful: true,
        Results: [
          {
            data: [
              {
                RecordVO: {
                  displayName: 'Test Record',
                },
              },
            ],
          },
        ],
      })
    );
    const result = await service.resolve(route.snapshot, null);

    expect(result.displayName).toBe('Test Record');
    expect(apiSpy).toHaveBeenCalled();
  });

  it('should display an error message if an error is thrown', async () => {
    spyOn(data, 'getItemByArchiveNbr').and.returnValue(undefined);
    const apiSpy = spyOn(api.record, 'get').and.rejectWith(
      new RecordResponse({
        isSuccessful: false,
        Results: [
          {
            message: ['Test Error'],
          },
        ],
      })
    );
    let displayedErrorMessage: string;
    spyOn(message, 'showError').and.callFake((message: string) => {
      displayedErrorMessage = message;
    });

    await expectAsync(service.resolve(route.snapshot, null)).toBeRejected();

    expect(displayedErrorMessage).toBe('Test Error');
  });
});
