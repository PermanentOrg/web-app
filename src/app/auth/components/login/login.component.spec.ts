import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

import { LoginComponent } from '@auth/components/login/login.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';
import { MessageService } from '@shared/services/message/message.service';
import { TEST_DATA } from '@core/core.module.spec';
import { AccountService } from '@shared/services/account/account.service';
import { FORM_ERROR_MESSAGES } from '@shared/utilities/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
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
        MessageService,
        AccountService
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
    component.loginForm.get('email').markAsTouched();
    component.loginForm.patchValue({
      email: '',
      password: TEST_DATA.user.password
    });
    expect(component.loginForm.invalid).toBeTruthy();
    expect(component.loginForm.get('email').errors.required).toBeTruthy();
  });

  it('should set error for invalid email', () => {
    component.loginForm.get('email').markAsTouched();
    component.loginForm.patchValue({
      email: 'lasld;f;aslkj',
      password: TEST_DATA.user.password
    });
    expect(component.loginForm.invalid).toBeTruthy();
    expect(component.loginForm.get('email').errors.email).toBeTruthy();
  });

  it('should set error for missing password', () => {
    component.loginForm.get('password').markAsTouched();
    component.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: ''
    });
    expect(component.loginForm.invalid).toBeTruthy();
    expect(component.loginForm.get('password').errors.required).toBeTruthy();
  });

  it('should set error for too short password', () => {
    component.loginForm.get('password').markAsTouched();
    component.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: 'short'
    });
    expect(component.loginForm.invalid).toBeTruthy();
    expect(component.loginForm.get('password').errors.minlength).toBeTruthy();
  });

  it('should have no errors when email and password valid', () => {
    component.loginForm.markAsTouched();
    component.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: TEST_DATA.user.password
    });
    expect(component.loginForm.valid).toBeTruthy();
  });
});
