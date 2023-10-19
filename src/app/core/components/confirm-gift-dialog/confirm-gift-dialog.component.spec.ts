/* @format */
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  TestModuleMetadata,
  tick,
} from '@angular/core/testing';
import { DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { SharedModule } from '@shared/shared.module';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
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

  const mockGiftResult = new BehaviorSubject<boolean>(false);

  beforeEach(async () => {
    const config: TestModuleMetadata = cloneDeep(Testing.BASE_TEST_CONFIG);

    dialogData = {
      email: 'test@example.com',
      amount: '10',
      message: 'test message',
      giftResult: new Observable(() => {}),
    };

    dialogRef = new DialogRef(1, null);

    config.imports.push(SharedModule);
    config.declarations.push(ConfirmGiftDialogComponent);
    config.providers.push({
      provide: DIALOG_DATA,
      useValue: {
        email: 'test@example.com',
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

  it('should take the email from the dialog data', () => {
    expect(component.emails).toEqual('test@example.com');
  });

  it('should take the amount from the dialog data', () => {
    expect(component.amount).toEqual(10);
  });

  it('should take the message from the dialog data', () => {
    expect(component.message).toEqual('test message');
  });

  it('should close when close method is called', () => {
    const dialogRefSpy = spyOn(dialogRef, 'close');

    component.onDoneClick();

    expect(dialogRefSpy).toHaveBeenCalled();
  });

  it('should close the dialog and send the data back when confirm method is called', fakeAsync(() => {
    const dialogRefSpy = spyOn(dialogRef, 'close');
    const giftResultSpy = spyOn(mockGiftResult, 'next');
    mockApiService.billing.giftStorage.and.returnValue(Promise.resolve());

    component.onConfirmClick();

    tick();

    expect(dialogRefSpy).toHaveBeenCalled();
    expect(giftResultSpy).toHaveBeenCalledWith(true);
  }));

  it('should handle failure in onConfirmClick', fakeAsync(() => {
    const errorResponse = 'Something went wrong!';
    const giftResultSpy = spyOn(mockGiftResult, 'next');
    const dialogRefSpy = spyOn(dialogRef, 'close');
    mockApiService.billing.giftStorage.and.returnValue(
      Promise.reject(errorResponse)
    );

    const messageService = TestBed.inject(MessageService);
    const showErrorSpy = spyOn(messageService, 'showError');

    component.onConfirmClick();
    tick();

    expect(showErrorSpy).toHaveBeenCalledWith(
      'Something went wrong! Please try again.'
    );
    expect(giftResultSpy).toHaveBeenCalledWith(false);

    expect(dialogRefSpy).toHaveBeenCalled();
  }));
});
