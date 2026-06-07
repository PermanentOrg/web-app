import { NgModule } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { DirectiveDisplayComponent } from './directive-display.component';

import {
	MockAccountService,
	MockApiService,
	MockDirectiveRepo,
} from './test-utils';

@NgModule()
class DummyModule {}

class MockMessageService {
	public static errorShown: boolean = false;
	public static lastMessage: string | null = null;

	public static reset(): void {
		MockMessageService.errorShown = false;
		MockMessageService.lastMessage = null;
	}

	public showError(options: { message: string }): void {
		MockMessageService.errorShown = true;
		MockMessageService.lastMessage = options.message;
	}
}

describe('DirectiveDisplayComponent', () => {
	let mockApiService: MockApiService;

	beforeEach(async () => {
		MockAccountService.mockArchive = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test',
		});
		MockDirectiveRepo.reset();
		MockMessageService.reset();
		MockDirectiveRepo.mockStewardEmail = 'test@example.com';
		MockDirectiveRepo.mockNote = 'Unit Testing!';
		MockDirectiveRepo.legacyContactName = 'Test User';
		MockDirectiveRepo.legacyContactEmail = 'test@example.com';
		mockApiService = new MockApiService();
		await MockBuilder(DirectiveDisplayComponent, DummyModule)
			.keep(AccountService)
			.keep(ApiService)
			.provide({
				provide: AccountService,
				useValue: new MockAccountService(),
			})
			.provide({
				provide: ApiService,
				useValue: mockApiService,
			})
			.provide({
				provide: MessageService,
				useClass: MockMessageService,
			});
	});

	it('should create', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();
		const instance = fixture.point.componentInstance;

		expect(instance).toBeTruthy();
		expect(ngMocks.findAll('.error').length).toBe(0);
	}));

	it('should fill in current archive info', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(
			ngMocks.findAll('.archive-steward-header')[0].nativeElement.innerText,
		).toContain('The Test Archive');
	}));

	it('should fetch directive info from API', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();
		const instance = fixture.point.componentInstance;

		expect(instance.directives.length).toBe(1);
		expect(
			ngMocks.findAll('.archive-steward-note')[0].nativeElement.innerText,
		).toContain('Unit Testing!');

		expect(
			ngMocks.findAll('.archive-steward-email')[0].nativeElement.innerText,
		).toContain('test@example.com');
	}));

	it('should render one card per directive', fakeAsync(() => {
		MockDirectiveRepo.mockDirectives = [
			new MockDirectiveRepo().createDirective(
				'first@example.com',
				'note 1',
				'directive-1',
			),
			new MockDirectiveRepo().createDirective(
				'second@example.com',
				'note 2',
				'directive-2',
			),
		];
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.archive-steward-card').length).toBe(2);
		const emails = ngMocks
			.findAll('.archive-steward-email')
			.map((el) => el.nativeElement.innerText.trim());

		expect(emails).toContain('first@example.com');
		expect(emails).toContain('second@example.com');
	}));

	it('should emit beginEdit with the clicked directive', fakeAsync(() => {
		MockDirectiveRepo.mockDirectives = [
			new MockDirectiveRepo().createDirective(
				'first@example.com',
				'note 1',
				'directive-1',
			),
		];
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();
		const instance = fixture.point.componentInstance;
		const beginEditSpy = spyOn(instance.beginEdit, 'emit');

		ngMocks
			.find('.archive-steward-card')
			.nativeElement.dispatchEvent(new Event('click'));

		expect(beginEditSpy).toHaveBeenCalledWith(instance.directives[0]);
	}));

	it('should emit beginEdit with null when the Add button is clicked', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();
		const instance = fixture.point.componentInstance;
		const beginEditSpy = spyOn(instance.beginEdit, 'emit');

		ngMocks.find('button').nativeElement.dispatchEvent(new Event('click'));

		expect(beginEditSpy).toHaveBeenCalledWith(null);
	}));

	it('should mark missing fields as not assigned', fakeAsync(() => {
		MockDirectiveRepo.mockDirectives = [
			new MockDirectiveRepo().createDirective(null, null, 'directive-empty'),
		];
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.not-assigned').length).toBe(2);
	}));

	it('should be able to handle API errors when fetching Directives', fakeAsync(() => {
		MockDirectiveRepo.failRequest = true;
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.error').length).toBe(1);
		expect(ngMocks.findAll('.archive-steward-card').length).toBe(0);
		expect(ngMocks.find('button').nativeElement.disabled).toBeTruthy();
		expect(MockMessageService.errorShown).toBeTrue();
	}));

	it('should show the "No Plan" warning if the user does not have a legacy contact and no stewards exist', async () => {
		TestBed.resetTestingModule();
		MockDirectiveRepo.reset();
		MockDirectiveRepo.legacyContactName = null;
		MockDirectiveRepo.legacyContactEmail = null;

		await TestBed.configureTestingModule({
			declarations: [DirectiveDisplayComponent],
			providers: [
				{ provide: AccountService, useValue: new MockAccountService() },
				{ provide: ApiService, useValue: new MockApiService() },
				{ provide: MessageService, useClass: MockMessageService },
			],
		}).compileComponents();

		const fixture = TestBed.createComponent(DirectiveDisplayComponent);
		const instance = fixture.componentInstance;
		fixture.detectChanges();

		await instance.ngOnInit();
		fixture.detectChanges();

		expect(instance.noPlan).toBeTrue();
		expect(
			fixture.nativeElement.querySelectorAll('.no-plan-warning').length,
		).toBe(1);

		expect(fixture.nativeElement.querySelector('button').disabled).toBeTruthy();
	});

	it('should not show the "No Plan" warning when at least one steward exists', async () => {
		TestBed.resetTestingModule();
		MockDirectiveRepo.reset();
		MockDirectiveRepo.legacyContactName = null;
		MockDirectiveRepo.legacyContactEmail = null;
		MockDirectiveRepo.mockDirectives = [
			new MockDirectiveRepo().createDirective(
				'existing@example.com',
				'note',
				'directive-1',
			),
		];

		await TestBed.configureTestingModule({
			declarations: [DirectiveDisplayComponent],
			providers: [
				{ provide: AccountService, useValue: new MockAccountService() },
				{ provide: ApiService, useValue: new MockApiService() },
				{ provide: MessageService, useClass: MockMessageService },
			],
		}).compileComponents();

		const fixture = TestBed.createComponent(DirectiveDisplayComponent);
		const instance = fixture.componentInstance;
		fixture.detectChanges();

		await instance.ngOnInit();
		fixture.detectChanges();

		expect(instance.noPlan).toBeTrue();
		expect(
			fixture.nativeElement.querySelectorAll('.no-plan-warning').length,
		).toBe(0);

		expect(fixture.nativeElement.querySelector('button').disabled).toBeFalsy();
	});

	it('should not show the "No Plan" warning if the user does have a legacy contact', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.no-plan-warning').length).toBe(0);
		expect(ngMocks.find('button').nativeElement.disabled).toBeFalsy();
	}));

	it('should be able to handle API errors when fetching Legacy Contact', async () => {
		TestBed.resetTestingModule();
		MockDirectiveRepo.reset();
		MockDirectiveRepo.failLegacyRequest = true;
		MockDirectiveRepo.mockStewardEmail = 'test@example.com';
		MockDirectiveRepo.mockNote = 'Unit Testing!';
		MockDirectiveRepo.legacyContactName = 'Test User';
		MockDirectiveRepo.legacyContactEmail = 'test@example.com';

		await TestBed.configureTestingModule({
			declarations: [DirectiveDisplayComponent],
			providers: [
				{ provide: AccountService, useValue: new MockAccountService() },
				{ provide: ApiService, useValue: new MockApiService() },
				{ provide: MessageService, useClass: MockMessageService },
			],
		}).compileComponents();

		const fixture = TestBed.createComponent(DirectiveDisplayComponent);
		const instance = fixture.componentInstance;
		fixture.detectChanges();

		await instance.ngOnInit();
		fixture.detectChanges();

		expect(instance.error).toBeTrue();
		expect(fixture.nativeElement.querySelectorAll('.error').length).toBe(1);
		expect(
			fixture.nativeElement.querySelectorAll('.archive-steward-card').length,
		).toBe(0);

		expect(fixture.nativeElement.querySelector('button').disabled).toBeTruthy();
	});

	it('should be able to disable the Legacy Contact check through an input', fakeAsync(() => {
		MockDirectiveRepo.legacyContactName = null;
		MockDirectiveRepo.legacyContactEmail = null;
		const fixture = MockRender(
			'<pr-directive-display [checkLegacyContact]="false"></pr-directive-display>',
		);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.no-plan-warning').length).toBe(0);
		expect(ngMocks.find('button').nativeElement.disabled).toBeFalsy();
	}));

	it('should always show "Add a new Archive Steward" on the bottom button', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.find('button').nativeElement.innerText).toContain(
			'Add a new Archive Steward',
		);
	}));
});
