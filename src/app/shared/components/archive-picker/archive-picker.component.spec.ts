import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ArchivePickerComponent } from './archive-picker.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

class MockDialogRef {
  close() {}
}

describe('ArchivePickerComponent', () => {
  let component: ArchivePickerComponent;
  let fixture: ComponentFixture<ArchivePickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ArchivePickerComponent],
    imports: [],
    providers: [
        { provide: DialogRef, useClass: MockDialogRef },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: ApiService, useValue: {} },
        { provide: AccountService, useValue: {} },
        MessageService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
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
