/* @format */
import { ForgotPasswordComponent } from '@auth/components/forgot-password/forgot-password.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

import { LogoComponent } from '@auth/components/logo/logo.component';
import { MessageService } from '@shared/services/message/message.service';

describe('MfaComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent, LogoComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [CookieService, MessageService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set error for missing email', () => {
    component.forgotForm.get('email').markAsTouched();
    component.forgotForm.patchValue({
      email: '',
    });

    expect(component.forgotForm.invalid).toBeTruthy();
    expect(component.forgotForm.get('email').errors.required).toBeTruthy();
  });

  it('should set error for invalid email', () => {
    component.forgotForm.get('email').markAsTouched();
    component.forgotForm.patchValue({
      email: 'test',
    });

    expect(component.forgotForm.invalid).toBeTruthy();
    expect(component.forgotForm.get('email').errors.email).toBeTruthy();
  });

  it('should display the loading spinner', () => {
    component.waiting = true;
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const loadingSpinner = compiled.querySelector('pr-loading-spinner');

    expect(loadingSpinner).toBeTruthy();
  });
});
