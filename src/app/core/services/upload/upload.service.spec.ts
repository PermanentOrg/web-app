/* @format */
import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { UploadService } from '@core/services/upload/upload.service';
import { DataService } from '@shared/services/data/data.service';
import { MessageService } from '@shared/services/message/message.service';
import { EventEmitter } from '@angular/core';
import {
  UploadProgressEvent,
  UploadSession,
  UploadSessionStatus,
} from './upload.session';

class TestUploadSession extends UploadSession {
  public emit(status: UploadSessionStatus): void {
    this.progress.emit({
      sessionStatus: status,
      statistics: {
        current: 0,
        completed: 0,
        total: 0,
        error: 0,
      },
    });
  }
}

class TestUploadService extends UploadService {
  private uploadEnd: Date;

  public getUploadStartTime(): Date {
    return this.uploadStart;
  }

  public getElapsedUploadTime(): number {
    if (this.uploadEnd) {
      return this.uploadEnd.getTime() - this.uploadStart.getTime();
    }
    return NaN;
  }

  protected reportUploadTime(): void {
    this.uploadEnd = new Date();
  }
}

class MessageStub {
  public showMessage(_msg: string): void {}
}

const uploadSessionMock = {
  progress: new EventEmitter<UploadProgressEvent>(),
};

describe('UploadService', () => {
  let service: TestUploadService;
  let session: TestUploadSession;
  let emittedSessionStatus;

  beforeEach(() => {
    const config = cloneDeep(Testing.BASE_TEST_CONFIG);
    const providers = config.providers as any[];
    providers.push({ provide: UploadService, useClass: TestUploadService });
    providers.push(DataService);
    providers.push({ provide: MessageService, useClass: MessageStub });
    providers.push({ provide: UploadSession, useClass: TestUploadSession });
    TestBed.configureTestingModule(config);
    service = TestBed.inject(UploadService) as TestUploadService;
    session = TestBed.inject(UploadSession) as TestUploadSession;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register upload session start time', () => {
    session.emit(UploadSessionStatus.Start);

    expect(service.getUploadStartTime()).not.toBeUndefined();
  });

  it('should output upload session elapsed time after upload is finished', () => {
    session.emit(UploadSessionStatus.Start);
    session.emit(UploadSessionStatus.Done);

    expect(service.getElapsedUploadTime()).toBeGreaterThan(-1);
  });

  it('should handle FileNoBytesError correctly', async () => {
    uploadSessionMock.progress.subscribe((event) => {
      emittedSessionStatus = event.sessionStatus;
    });

    const mockEvent: UploadProgressEvent = {
      item: null,
      sessionStatus: UploadSessionStatus.FileNoBytesError,
      statistics: { current: 0, total: 0, error: 0, completed: 0 },
    };

    uploadSessionMock.progress.emit(mockEvent);

    expect(emittedSessionStatus).toBe(UploadSessionStatus.FileNoBytesError);
  });
});
