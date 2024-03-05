import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchivePickerComponent } from './archive-picker.component';

describe('ArchivePickerComponent', () => {
  let component: ArchivePickerComponent;
  let fixture: ComponentFixture<ArchivePickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ArchivePickerComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: ApiService, useValue: {} },
        { provide: AccountService, useValue: {} },
        MessageService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
