import { NgModule } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { DirectiveDisplayComponent } from './directive-display.component';

import {
	MockAccountService,
	MockApiService,
	MockDirectiveRepo,
} from './test-utils';

@NgModule()
class DummyModule {}

describe('DirectiveDisplayComponent', () => {
	let mockApiService: MockApiService;

	beforeEach(async () => {
		MockAccountService.mockArchive = new ArchiveVO({
			archiveId: 1,
			fullName: 'Test',
		});
		MockDirectiveRepo.reset();
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

		expect(instance.directive).not.toBeUndefined();
		expect(
			ngMocks.findAll('.archive-steward-note')[0].nativeElement.innerText,
		).toContain('Unit Testing!');

		expect(
			ngMocks.findAll('.archive-steward-email')[0].nativeElement.innerText,
		).toContain('test@example.com');
	}));

	it('should format null fields properly', fakeAsync(() => {
		MockDirectiveRepo.reset();
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.not-assigned').length).toBeGreaterThan(0);
	}));

	it('should format filled out fields properly', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.not-assigned').length).toBe(0);
	}));

	it('should be able to handle API errors when fetching Directive', fakeAsync(() => {
		MockDirectiveRepo.failRequest = true;
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.error').length).toBe(1);
		expect(ngMocks.findAll('.archive-steward-table').length).toBe(0);
		expect(ngMocks.find('button').nativeElement.disabled).toBeTruthy();
	}));

	it('should show the "No Plan" warning if the user does not have a legacy contact', async () => {
		// Reset TestBed and reconfigure for this test
		TestBed.resetTestingModule();
		MockDirectiveRepo.reset();
		MockDirectiveRepo.legacyContactName = null;
		MockDirectiveRepo.legacyContactEmail = null;
		MockDirectiveRepo.mockStewardEmail = 'test@example.com';
		MockDirectiveRepo.mockNote = 'Unit Testing!';

		await TestBed.configureTestingModule({
			declarations: [DirectiveDisplayComponent],
			providers: [
				{ provide: AccountService, useValue: new MockAccountService() },
				{ provide: ApiService, useValue: new MockApiService() },
			],
		}).compileComponents();

		const fixture = TestBed.createComponent(DirectiveDisplayComponent);
		const instance = fixture.componentInstance;
		fixture.detectChanges();

		// Wait for ngOnInit to complete
		await instance.ngOnInit();
		fixture.detectChanges();

		expect(instance.noPlan).toBeTrue();
		expect(
			fixture.nativeElement.querySelectorAll('.no-plan-warning').length,
		).toBe(1);

		expect(fixture.nativeElement.querySelector('button').disabled).toBeTruthy();
	});

	it('should not show the "No Plan" warning if the user does have a legacy contact', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.findAll('.no-plan-warning').length).toBe(0);
		expect(ngMocks.find('button').nativeElement.disabled).toBeFalsy();
	}));

	it('should be able to handle API errors when fetching Legacy Contact', async () => {
		// Reset TestBed and reconfigure for this test
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
			],
		}).compileComponents();

		const fixture = TestBed.createComponent(DirectiveDisplayComponent);
		const instance = fixture.componentInstance;
		fixture.detectChanges();

		// Wait for ngOnInit to complete
		await instance.ngOnInit();
		fixture.detectChanges();

		expect(instance.error).toBeTrue();
		expect(fixture.nativeElement.querySelectorAll('.error').length).toBe(1);
		expect(
			fixture.nativeElement.querySelectorAll('.archive-steward-table').length,
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

	it('should say "Assign" for new directive', fakeAsync(() => {
		MockDirectiveRepo.mockStewardEmail = null;
		MockDirectiveRepo.mockNote = null;
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.find('button').nativeElement.innerText).toContain('Assign');
		expect(ngMocks.find('button').nativeElement.innerText).not.toContain(
			'Edit',
		);
	}));

	it('should say "Edit" for existing directive', fakeAsync(() => {
		const fixture = MockRender(DirectiveDisplayComponent);
		flush();
		fixture.detectChanges();

		expect(ngMocks.find('button').nativeElement.innerText).toContain('Edit');
	}));
});
