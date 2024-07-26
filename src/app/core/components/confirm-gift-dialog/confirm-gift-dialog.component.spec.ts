/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { BehaviorSubject } from 'rxjs';
import { GiftingResponse } from '@shared/services/api/billing.repo';
import { ConfirmGiftDialogComponent } from './confirm-gift-dialog.component';

class MockDialogRef {
  close(value?: any): void {}
}

describe('ConfirmGiftDialogComponent', () => {
  let component: ConfirmGiftDialogComponent;
  let fixture: ComponentFixture<ConfirmGiftDialogComponent>;
  let dialogRef: MockDialogRef;

  const mockGiftResult = new BehaviorSubject<{
    isSuccessful: boolean;
    response: GiftingResponse;
  }>({ isSuccessful: false, response: null });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmGiftDialogComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: { giftResult: mockGiftResult } },
        { provide: DialogRef, useClass: MockDialogRef },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmGiftDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(DialogRef) as unknown as MockDialogRef;
    spyOn(dialogRef, 'close').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog when onDoneClick is called', () => {
    component.onDoneClick();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should close the dialog when onConfrmClick is called, calling it with true', () => {
    component.onConfirmClick();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
