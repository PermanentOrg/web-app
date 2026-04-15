import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';

import { SignupComponent } from '@auth/components/signup/signup.component';
import { LogoComponent } from '@auth/components/logo/logo.component';
import { FormInputComponent } from '@shared/components/form-input/form-input.component';

import { TEST_DATA } from '@core/core.module.spec';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { AccountVO } from '@models/account-vo';
import { AccountService } from '@shared/services/account/account.service';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';

import { vi } from 'vitest';

describe('SignupComponent', () => {
	let component: SignupComponent;
	let fixture: ComponentFixture<SignupComponent>;
	let accountService: AccountService;
	let onboardingService: OnboardingService;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			declarations: [SignupComponent, LogoComponent, FormInputComponent],
			imports: [FormsModule, ReactiveFormsModule, RouterTestingModule],
			providers: [
				CookieService,
				MessageService,
				ApiService,
				AccountService,
				OnboardingService,
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							queryParams: {
								fullName: window.btoa(TEST_DATA.user.name),
								primaryEmail: window.btoa(TEST_DATA.user.email),
								inviteCode: 'invite',
							},
						},
					},
				},
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(SignupComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		accountService = TestBed.inject(AccountService);
		onboardingService = TestBed.inject(OnboardingService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should fill form from URL params', () => {
		expect(component.signupForm.value.email).toBe(TEST_DATA.user.email);
		expect(component.signupForm.value.name).toBe(TEST_DATA.user.name);
		expect(component.signupForm.value.invitation).toBe('invite');
	});

	// it('should set error for missing invitation code', () => {
	//   component.signupForm.get('invitation').markAsTouched();
	//   component.signupForm.patchValue({
	//     invitation: '',
	//     email: TEST_DATA.user.email,
	//     name: TEST_DATA.user.name,
	//     password: TEST_DATA.user.password,
	//     confirm: TEST_DATA.user.password
	//   });
	//   expect(component.signupForm.invalid).toBeTruthy();
	//   expect(component.signupForm.get('invitation').errors.required).toBeTruthy();
	// });

	it('should set error for missing email', () => {
		component.signupForm.get('email').markAsTouched();
		component.signupForm.patchValue({
			invitation: 'invite',
			email: '',
			name: TEST_DATA.user.name,
			password: TEST_DATA.user.password,
			confirm: TEST_DATA.user.password,
		});

		expect(component.signupForm.invalid).toBeTruthy();
		expect(component.signupForm.get('email').errors.required).toBeTruthy();
	});

	it('should set error for invalid email', () => {
		component.signupForm.get('email').markAsTouched();
		component.signupForm.patchValue({
			email: 'lasld;f;aslkj',
		});

		expect(component.signupForm.invalid).toBeTruthy();
		expect(component.signupForm.get('email').errors.email).toBeTruthy();
	});

	it('should set error for missing name', () => {
		component.signupForm.get('name').markAsTouched();
		component.signupForm.patchValue({
			name: '',
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
			confirm: null,
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
			confirm: 'ass',
		});

		expect(component.signupForm.invalid).toBeTruthy();
		expect(component.signupForm.get('password').errors.minlength).toBeTruthy();
	});

	it('should set invalid for mismatched password', () => {
		component.signupForm.get('password').markAsTouched();
		component.signupForm.patchValue({
			password: 'longenough',
			confirm: 'longenougher',
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
			confirm: TEST_DATA.user.password,
		});

		expect(component.signupForm.valid).toBeTruthy();
	});

	it('should display the loading spinner', () => {
		component.waiting = true;
		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();
		const compiled = fixture.debugElement.nativeElement;
		const loadingSpinner = compiled.querySelector('pr-loading-spinner');

		expect(loadingSpinner).toBeTruthy();
	});

	it('should reset onboarding session state when onSubmit is called', () => {
		vi.spyOn(onboardingService, 'resetOnboardingState');

		vi.spyOn(accountService, 'signUp').mockReturnValue(
			Promise.resolve(new AccountVO({})),
		);

		component.onSubmit({
			email: 'test@example.com',
			name: 'Test User',
			password: 'password123',
			confirm: 'password123',
			invitation: '',
		});

		expect(onboardingService.resetOnboardingState).toHaveBeenCalled();
	});

	it('should pass receiveUpdatesViaEmail to signUp correctly', () => {
		const formValue = {
			email: 'test@example.com',
			name: 'Test User',
			password: 'password123',
			confirm: 'password123',
			invitation: 'inviteCode',
		};

		component.receiveUpdatesViaEmail = true;
		component.agreedTerms = true; // assuming agreedTerms is needed

		vi.spyOn(accountService, 'signUp').mockReturnValue(
			Promise.resolve(new AccountVO({})),
		);

		component.onSubmit(formValue);

		expect(accountService.signUp).toHaveBeenCalledWith(
			formValue.email,
			formValue.name,
			formValue.password,
			formValue.confirm,
			component.agreedTerms,
			true, // checks receiveUpdatesViaEmail is true
			null,
			formValue.invitation,
			component.shouldCreateDefaultArchive(),
		);
	});
});
