import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';

import { SignupComponent } from '@auth/components/signup/signup.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

import { TEST_DATA } from '@core/core.module.spec';
import { Router, ActivatedRoute } from '@angular/router';
import { FORM_ERROR_MESSAGES } from '@shared/utilities/forms';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SignupComponent,
        LogoComponent,
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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {
                fullName: window.btoa(TEST_DATA.user.name),
                primaryEmail: window.btoa(TEST_DATA.user.email),
                inviteCode: window.btoa('invite')
              }
            }
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fill form from URL params', () => {
    expect(component.signupForm.value.email).toBe(TEST_DATA.user.email);
    expect(component.signupForm.value.name).toBe(TEST_DATA.user.name);
    expect(component.signupForm.value.invitation).toBe('invite');
  });

  it('should set error for missing invitation code', () => {
    component.signupForm.get('invitation').markAsTouched();
    component.signupForm.patchValue({
      invitation: '',
      email: TEST_DATA.user.email,
      name: TEST_DATA.user.name,
      password: TEST_DATA.user.password,
      confirm: TEST_DATA.user.password
    });
    expect(component.signupForm.invalid).toBeTruthy();
    expect(component.signupForm.get('invitation').errors.required).toBeTruthy();
  });

  it('should set error for missing email', () => {
    component.signupForm.get('email').markAsTouched();
    component.signupForm.patchValue({
      invitation: 'invite',
      email: '',
      name: TEST_DATA.user.name,
      password: TEST_DATA.user.password,
      confirm: TEST_DATA.user.password
    });
    expect(component.signupForm.invalid).toBeTruthy();
    expect(component.signupForm.get('email').errors.required).toBeTruthy();
  });

  it('should set error for invalid email', () => {
    component.signupForm.get('email').markAsTouched();
    component.signupForm.patchValue({
      email: 'lasld;f;aslkj'
    });
    expect(component.signupForm.invalid).toBeTruthy();
    expect(component.signupForm.get('email').errors.email).toBeTruthy();
  });

  it('should set error for missing name', () => {
    component.signupForm.get('name').markAsTouched();
    component.signupForm.patchValue({
      name: ''
    });
    expect(component.signupForm.invalid).toBeTruthy();
    expect(component.signupForm.get('name').errors.required).toBeTruthy();
  });

  it('should set error for missing password', () => {
    component.signupForm.get('password').markAsTouched();
    component.signupForm.get('confirm').markAsTouched();
    component.signupForm.patchValue({
      invitation: 'invite',
      email: TEST_DATA.user.email,
      name: TEST_DATA.user.name,
      password: null,
      confirm: null
    });
    fixture.whenStable().then(() => {
      expect(component.signupForm.invalid).toBeTruthy();
      expect(component.signupForm.get('password').errors.required).toBeTruthy();
      expect(component.signupForm.get('confirm').errors.required).toBeTruthy();
    });
  });

  it('should set invalid for too short password', () => {
    component.signupForm.get('password').markAsTouched();
    component.signupForm.get('confirm').markAsTouched();
    component.signupForm.patchValue({
      password: 'ass',
      confirm: 'ass'
    });
    expect(component.signupForm.invalid).toBeTruthy();
    expect(component.signupForm.get('password').errors.minlength).toBeTruthy();
  });

  it('should set invalid for mismatched password', () => {
    component.signupForm.get('password').markAsTouched();
    component.signupForm.patchValue({
      password: 'longenough',
      confirm: 'longenougher'
    });
    expect(component.signupForm.invalid).toBeTruthy();
    expect(component.signupForm.get('confirm').errors.mismatch).toBeTruthy();
  });

  it('should have no errors when email and password valid', () => {
    component.signupForm.markAsTouched();
    component.signupForm.patchValue({
      optIn: false,
      agreed: true,
      name: TEST_DATA.user.name,
      invitation: 'perm',
      email: TEST_DATA.user.email,
      password: TEST_DATA.user.password,
      confirm: TEST_DATA.user.password
    });
    expect(component.signupForm.valid).toBeTruthy();
  });
});
