import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MessageService } from '@shared/services/message/message.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangePasswordComponent } from './change-password.component';

class MessageStub {
  public showMessage(_msg: string): void {}
}

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ChangePasswordComponent],
    imports: [],
    providers: [
        {
            provide: MessageService,
            useClass: MessageStub,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
