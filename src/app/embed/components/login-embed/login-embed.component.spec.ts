import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';

import { LoginEmbedComponent } from '@embed/components/login-embed/login-embed.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

import { TEST_DATA } from '@core/core.module.spec';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';

fdescribe('LoginEmbedComponent', () => {
  let component: LoginEmbedComponent;
  let fixture: ComponentFixture<LoginEmbedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LoginEmbedComponent,
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
        AccountService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                invite: 'invite'
              }
            }
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginEmbedComponent);

    const accountService = TestBed.get(AccountService) as AccountService;
    accountService.clearAccount();
    accountService.clearArchive();

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set error for missing email', () => {
    component.loginForm.get('email').markAsTouched();
    component.loginForm.patchValue({
      email: '',
      password: TEST_DATA.user.password,
    });
    expect(component.loginForm.invalid).toBeTruthy();
    expect(component.loginForm.get('email').errors.required).toBeTruthy();
  });

  it('should set error for invalid email', () => {
    component.loginForm.get('email').markAsTouched();
    component.loginForm.patchValue({
      email: 'lasld;f;aslkj'
    });
    expect(component.loginForm.invalid).toBeTruthy();
    expect(component.loginForm.get('email').errors.email).toBeTruthy();
  });

  it('should set error for missing password', () => {
    component.loginForm.get('password').markAsTouched();
    component.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: null,
    });
    fixture.whenStable().then(() => {
      expect(component.loginForm.invalid).toBeTruthy();
      expect(component.loginForm.get('password').errors.required).toBeTruthy();
    });
  });

  it('should set invalid for too short password', () => {
    component.loginForm.get('password').markAsTouched();
    component.loginForm.patchValue({
      password: 'ass'
    });
    expect(component.loginForm.invalid).toBeTruthy();
    expect(component.loginForm.get('password').errors.minlength).toBeTruthy();
  });

  it('should have no errors when email and password valid', () => {
    component.loginForm.markAsTouched();
    component.loginForm.patchValue({
      email: TEST_DATA.user.email,
      password: TEST_DATA.user.password,
    });
    expect(component.loginForm.valid).toBeTruthy();
  });
});
