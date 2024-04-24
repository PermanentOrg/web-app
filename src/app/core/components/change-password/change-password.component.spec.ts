import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageService } from '@shared/services/message/message.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: MessageService,
          useClass: MessageStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
