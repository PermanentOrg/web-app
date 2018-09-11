import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';

import { SignupComponent, FORM_ERROR_MESSAGES } from '@auth/components/signup/signup.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

import { TEST_DATA } from '@core/core.module.spec';

fdescribe('SignupComponent', () => {
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
        MessageService
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

  it('should set error for missing invitation code', () => {
    (component.signupForm.controls['invitation'] as FormControl).markAsTouched();
    component.signupForm.patchValue({
      invitation: ''
    });
    expect(component.formErrors.invitation).toBeTruthy();
  });

  it('should set error for missing email', () => {
    (component.signupForm.controls['email'] as FormControl).markAsTouched();
    component.signupForm.patchValue({
      email: ''
    });
    expect(component.formErrors.email).toBeTruthy();
  });

  it('should set error for invalid email', () => {
    (component.signupForm.controls['email'] as FormControl).markAsTouched();
    component.signupForm.patchValue({
      email: 'lasld;f;aslkj'
    });
    expect(component.formErrors.email).toBeTruthy();
  });

  it('should set error for missing name', () => {
    (component.signupForm.controls['name'] as FormControl).markAsTouched();
    component.signupForm.patchValue({
      name: ''
    });
    expect(component.formErrors.name).toBeTruthy();
  });

  it('should set error for missing password', () => {
    (component.signupForm.controls['passwords'] as FormGroup).markAsTouched();
    component.signupForm.patchValue({
      passwords: {
        password: null,
        confirm: null
      }
    });
    fixture.whenStable().then(() => {
      expect(component.signupForm.invalid).toBeTruthy();
      expect(component.formErrors.passwords).toEqual(FORM_ERROR_MESSAGES.passwords.required);
    });
  });

  it('should set error for too short password', () => {
    (component.signupForm.controls['passwords'] as FormControl).markAsTouched();
    component.signupForm.patchValue({
      passwords: {
        password: 'ass',
        confirm: 'ass'
      }
    });
    expect(component.signupForm.invalid).toBeTruthy();
    expect(component.formErrors.passwords).toEqual(FORM_ERROR_MESSAGES.passwords.minlength);
  });

  it('should set error for mismatched password', () => {
    (component.signupForm.controls['passwords'] as FormControl).markAsTouched();
    component.signupForm.patchValue({
      passwords: {
        password: 'longenough',
        confirm: 'longenougher'
      }
    });
    expect(component.signupForm.invalid).toBeTruthy();
    expect(component.formErrors.passwords).toEqual(FORM_ERROR_MESSAGES.passwords.mismatch);
  });

  it('should have no errors when email and password valid', () => {
    (component.signupForm.controls['passwords'] as FormControl).markAsTouched();
    (component.signupForm.controls['email'] as FormControl).markAsTouched();
    component.signupForm.patchValue({
      optIn: false,
      agreed: true,
      name: TEST_DATA.user.name,
      invitation: 'perm',
      email: TEST_DATA.user.email,
      passwords: {
        password: TEST_DATA.user.password,
        confirm: TEST_DATA.user.password
      }
    });
    expect(component.formErrors.email).toBeFalsy();
    expect(component.formErrors.passwords).toBeFalsy();
  });
});
