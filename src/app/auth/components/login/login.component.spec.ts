import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

import { LoginComponent, FORM_ERROR_MESSAGES } from '@auth/components/login/login.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';
import { MessageService } from '@shared/services/message/message.service';
import { TEST_DATA } from '@core/core.module.spec';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LogoComponent,
        LoginComponent,
        FormInputComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        CookieService,
        MessageService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const cookieService = TestBed.get(CookieService) as CookieService;
    cookieService.set('rememberMe', TEST_DATA.account.primaryEmail);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should autofill with the email from cookies', () => {
    expect(component.loginForm.value.email).toEqual(TEST_DATA.account.primaryEmail);
  });

  it('should set error for missing email', () => {
    (component.loginForm.controls['email'] as FormControl).markAsTouched();
    component.loginForm.patchValue({
      email: ''
    });
    expect(component.formErrors.email).toBeTruthy();
  });

  it('should set error for invalid email', () => {
    (component.loginForm.controls['email'] as FormControl).markAsTouched();
    component.loginForm.patchValue({
      email: 'lasld;f;aslkj'
    });
    expect(component.formErrors.email).toBeTruthy();
  });

  it('should set error for missing password', () => {
    (component.loginForm.controls['password'] as FormControl).markAsTouched();
    component.loginForm.patchValue({
      password: ''
    });
    expect(component.formErrors.password).toBeTruthy();
    expect(component.formErrors.password).toEqual(FORM_ERROR_MESSAGES.password.required);
  });

  it('should set error for too short password', () => {
    (component.loginForm.controls['password'] as FormControl).markAsTouched();
    component.loginForm.patchValue({
      password: 'short'
    });
    expect(component.formErrors.password).toBeTruthy();
    expect(component.formErrors.password).toEqual(FORM_ERROR_MESSAGES.password.minlength);
  });

  it('should have no errors when email and password valid', () => {
    (component.loginForm.controls['password'] as FormControl).markAsTouched();
    (component.loginForm.controls['email'] as FormControl).markAsTouched();
    component.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: TEST_DATA.user.password
    });
    expect(component.formErrors.email).toBeFalsy();
    expect(component.formErrors.password).toBeFalsy();
  });
});
