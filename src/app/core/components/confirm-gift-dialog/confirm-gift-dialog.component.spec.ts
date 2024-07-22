/* @format */
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '@shared/services/api/api.service';
import { GiftingResponse } from '@shared/services/api/billing.repo';
import { MessageService } from '@shared/services/message/message.service';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ConfirmGiftDialogComponent } from './confirm-gift-dialog.component';

class MockMessageService {
  public static errorShown: boolean = false;

  public static reset(): void {
    MockMessageService.errorShown = false;
  }

  public showError(_msg: string): void {
    MockMessageService.errorShown = true;
  }
}

class MockDialogRef {
  close(value): void {}
}

describe('ConfirmGiftDialogComponent', () => {
  let component: ConfirmGiftDialogComponent;
  let fixture: ComponentFixture<ConfirmGiftDialogComponent>;
  let dialogRef: DialogRef;
  let dialogData: {
    email: string;
    amount: string;
    message: string;
    giftResult: Observable<void>;
  };

  const mockApiService = {
    billing: {
      giftStorage: jasmine
        .createSpy('giftStorage')
        .and.returnValue(Promise.resolve()),
    },
  };

  const mockGiftResult = new BehaviorSubject<{
    isSuccessful: boolean;
    response: GiftingResponse;
  }>({ isSuccessful: false, response: null });

  beforeEach(async () => {
    const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

    dialogData = {
      email: 'test@example.com',
      amount: '10',
      message: 'test message',
      giftResult: new Observable(() => {}),
    };

    config.imports.push(SharedModule);
    config.declarations.push(ConfirmGiftDialogComponent);
    config.providers.push({
      provide: DIALOG_DATA,
      useValue: {
        emails: ['test@example.com', 'test2@example.com'],
        amount: 10,
        message: 'test message',
        giftResult: mockGiftResult,
      },
    });
    config.providers.push({
      provide: DialogRef,
      useValue: dialogRef,
    });

    config.providers.push({
      provide: ApiService,
      useValue: mockApiService,
    });

    config.providers.push({ provide: DialogRef, useClass: MockDialogRef });

    config.providers.push({
      provide: MessageService,
      useClass: MockMessageService,
    });

    await TestBed.configureTestingModule(config).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmGiftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
