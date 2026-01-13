import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ngMocks } from 'ng-mocks';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from '@auth/components/login/login.component';
import { MessageService } from '@shared/services/message/message.service';
import { TEST_DATA } from '@core/core.module.spec';
import { AccountService } from '@shared/services/account/account.service';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { DeviceService } from '@shared/services/device/device.service';
import { ArchiveVO } from '@models/index';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const testEmail = 'unittest@example.com';

class MockAccountService {
	public switchedToDefaultArchive: boolean = false;
	public archives: ArchiveVO[] = [];
	public mfaResponse: boolean = false;
	public failResponse: boolean = false;
	public responseMessage: string = '';
	public async logIn(
		_email: string,
		_password: string,
		_rememberMe: string,
		_keepLoggedIn: string,
	) {
		const resp = new AuthResponse({
			isSuccessful: !this.failResponse && !this.mfaResponse,
		});
		resp.setMessage([this.responseMessage]);
		if (this.failResponse) {
			throw resp;
		} else {
			return resp;
		}
	}

	public async refreshArchives() {
		return this.archives;
	}

	public getArchives() {
		return this.archives;
	}

	public async switchToDefaultArchive() {
		this.switchedToDefaultArchive = true;
	}
}

class MockActivatedRoute {
	public snapshot: { queryParams: Record<string, string> } = {
		queryParams: {},
	};
}

class MockMessageService {
	showMessage(_: string) {}
}

class LoginTestingHarness {
	private component: LoginComponent;
	public navigateSpy: jasmine.Spy;
	constructor(
		private account: MockAccountService,
		private route: MockActivatedRoute,
	) {}

	public setComponent(instance: LoginComponent) {
		this.component = instance;
	}

	public setupLoginError(): void {
		this.account.failResponse = true;
		this.account.responseMessage = 'unknown error';
	}

	public setupIncorrectLogin(): void {
		this.account.failResponse = true;
		this.account.responseMessage = 'warning.signin.unknown';
	}

	public setupMfa(): void {
		this.account.mfaResponse = true;
		this.account.responseMessage = 'warning.auth.mfaToken';
	}

	public setupVerify(): void {
		this.account.mfaResponse = true;
		this.account.responseMessage = 'status.auth.need';
	}

	public setupShareByUrl(param: string): void {
		this.route.snapshot.queryParams.shareByUrl = param;
	}

	public setupTimelineCta(): void {
		this.route.snapshot.queryParams.cta = 'timeline';
	}

	public setupNormalLogin(): void {
		this.account.archives = [new ArchiveVO({ archiveId: 1 })];
	}

	public setupOnboarding(): void {
		this.account.archives = [];
	}

	public async testLogin() {
		this.component.loginForm.patchValue({
			email: testEmail,
			password: 'testpassword',
		});

		await this.component.onSubmit({
			email: testEmail,
			password: 'testpassword',
			rememberMe: true,
			keepLoggedIn: true,
		});
	}

	public getMessageSpy() {
		return spyOn(ngMocks.get(MessageService), 'showMessage').and.callThrough();
	}

	public hasPasswordBeenCleared(): boolean {
		return this.component.loginForm.value.password.length === 0;
	}
}

describe('LoginComponent', () => {
	let fixture: ComponentFixture<LoginComponent>;
	let instance: LoginComponent;
	let cookieService: Map<string, string>;
	let accountService: MockAccountService;
	let activatedRoute: MockActivatedRoute;
	let harness: LoginTestingHarness;

	beforeEach(async () => {
		accountService = new MockAccountService();
		activatedRoute = new MockActivatedRoute();
		cookieService = new Map<string, string>();
		cookieService.set('rememberMe', testEmail);
		harness = new LoginTestingHarness(accountService, activatedRoute);

		await TestBed.configureTestingModule({
			imports: [ReactiveFormsModule, RouterTestingModule, NoopAnimationsModule],
			declarations: [LoginComponent],
			providers: [
				{ provide: AccountService, useValue: accountService },
				{ provide: ActivatedRoute, useValue: activatedRoute },
				{ provide: CookieService, useValue: cookieService },
				{ provide: MessageService, useClass: MockMessageService },
				{
					provide: DeviceService,
					useValue: {
						isMobile() {
							return true;
						},
					},
				},
			],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(LoginComponent);
		instance = fixture.componentInstance;
		const router = TestBed.inject(Router);
		harness.navigateSpy = spyOn(router, 'navigate').and.returnValue(
			Promise.resolve(true),
		);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(instance).toBeTruthy();
	});

	it('should autofill with the email from cookies', () => {
		expect(instance.loginForm.value.email).toEqual(testEmail);
	});

	it('should set error for missing email', () => {
		instance.loginForm.get('email').markAsTouched();
		instance.loginForm.patchValue({
			email: '',
			password: TEST_DATA.user.password,
		});

		expect(instance.loginForm.invalid).toBeTruthy();
		expect(instance.loginForm.get('email').errors.required).toBeTruthy();
	});

	it('should set error for invalid email', () => {
		instance.loginForm.get('email').markAsTouched();
		instance.loginForm.patchValue({
			email: 'lasld;f;aslkj',
			password: TEST_DATA.user.password,
		});

		expect(instance.loginForm.invalid).toBeTruthy();
		expect(instance.loginForm.get('email').errors.email).toBeTruthy();
	});

	it('should set error for missing password', () => {
		instance.loginForm.get('password').markAsTouched();
		instance.loginForm.patchValue({
			email: TEST_DATA.user.email,
			password: '',
		});

		expect(instance.loginForm.invalid).toBeTruthy();
		expect(instance.loginForm.get('password').errors.required).toBeTruthy();
	});

	it('should set error for too short password', () => {
		instance.loginForm.get('password').markAsTouched();
		instance.loginForm.patchValue({
			email: TEST_DATA.user.email,
			password: 'short',
		});

		expect(instance.loginForm.invalid).toBeTruthy();
		expect(instance.loginForm.get('password').errors.minlength).toBeTruthy();
	});

	it('should have no errors when email and password valid', () => {
		instance.loginForm.markAsTouched();
		instance.loginForm.patchValue({
			email: TEST_DATA.user.email,
			password: TEST_DATA.user.password,
		});

		expect(instance.loginForm.valid).toBeTruthy();
	});

	it('should log in the user if they have archives', async () => {
		harness.setComponent(instance);
		harness.setupNormalLogin();
		await harness.testLogin();

		expect(harness.navigateSpy).toHaveBeenCalledWith(['/'], jasmine.anything());
		expect(accountService.switchedToDefaultArchive).toBeTrue();
	});

	it('should redirect to onboarding if the user has no archives', async () => {
		harness.setComponent(instance);
		harness.setupOnboarding();
		await harness.testLogin();

		expect(harness.navigateSpy).toHaveBeenCalledWith(['/app/onboarding']);
	});

	it('should redirect to public if the user is coming from timeline view', async () => {
		harness.setComponent(instance);
		harness.setupTimelineCta();
		await harness.testLogin();

		expect(harness.navigateSpy).toHaveBeenCalledWith(
			['/public'],
			jasmine.objectContaining({ queryParams: { cta: 'timeline' } }),
		);
	});

	it('should redirect to a sharebyurl if the param is set', async () => {
		harness.setComponent(instance);
		harness.setupShareByUrl('test-1234');
		await harness.testLogin();

		expect(harness.navigateSpy).toHaveBeenCalledWith(['/share', 'test-1234']);
	});

	it('should redirect to Verify page if user needs verification', async () => {
		harness.setComponent(instance);
		harness.setupVerify();
		await harness.testLogin();

		expect(harness.navigateSpy).toHaveBeenCalledWith(
			['..', 'verify'],
			jasmine.anything(),
		);
	});

	it('should redirect to MFA page if user needs MFA', async () => {
		harness.setComponent(instance);
		harness.setupMfa();
		await harness.testLogin();

		expect(harness.navigateSpy).toHaveBeenCalledWith(
			['..', 'mfa'],
			jasmine.anything(),
		);
	});

	it('should show an error message in case of login failure', async () => {
		harness.setComponent(instance);
		harness.setupLoginError();
		const messageSpy = harness.getMessageSpy();
		await harness.testLogin();

		expect(messageSpy).toHaveBeenCalled();
		expect(harness.hasPasswordBeenCleared()).toBeFalse();
	});

	it('should show an error message in case of wrong username/password', async () => {
		harness.setComponent(instance);
		harness.setupIncorrectLogin();
		const messageSpy = harness.getMessageSpy();
		await harness.testLogin();

		expect(messageSpy).toHaveBeenCalled();
		expect(harness.hasPasswordBeenCleared()).toBeTrue();
	});

	it('should display the loading spinner', () => {
		instance.waiting = true;
		fixture.detectChanges();
		const compiled = fixture.debugElement.nativeElement;
		const loadingSpinner = compiled.querySelector('pr-loading-spinner');

		expect(loadingSpinner).toBeTruthy();
	});
});
