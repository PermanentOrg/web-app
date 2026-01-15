import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FormsModule } from '@angular/forms';
import { DirectiveData } from '@models/directive';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { EventService } from '@shared/services/event/event.service';
import { MessageService } from '@shared/services/message/message.service';
import { MockAccountService } from '../directive-display/test-utils';
import { DirectiveEditComponent } from './directive-edit.component';
import {
	MockDirectiveRepo,
	MockMessageService,
	createDirective,
} from './test-utils';

@NgModule()
class DummyModule {}

class MockApiService {
	public directive = new MockDirectiveRepo();
}

describe('DirectiveEditComponent', () => {
	const fillOutForm = (email: string, note: string) => {
		const emailInput = ngMocks.findAll('.archive-steward-email')[0]
			.nativeElement as HTMLInputElement;
		const noteInput = ngMocks.findAll('.archive-steward-note')[0]
			.nativeElement as HTMLTextAreaElement;

		emailInput.value = email;
		emailInput.dispatchEvent(new Event('input'));
		noteInput.value = note;
		noteInput.dispatchEvent(new Event('input'));
	};

	beforeEach(async () => {
		MockDirectiveRepo.reset();
		MockMessageService.reset();
		await MockBuilder(DirectiveEditComponent, DummyModule)
			.keep(FormsModule, { export: true })
			.provide({
				provide: ApiService,
				useClass: MockApiService,
			})
			.provide({
				provide: AccountService,
				useClass: MockAccountService,
			})
			.provide({
				provide: MessageService,
				useClass: MockMessageService,
			})
			.keep(EventService);
	});

	it('should create', () => {
		const fixture = MockRender(DirectiveEditComponent);

		expect(fixture.point.componentInstance).not.toBeNull();
	});

	it('should be able to fill out the directive form', () => {
		const fixture = MockRender(DirectiveEditComponent);
		const instance = fixture.point.componentInstance;

		expect(ngMocks.findAll('.archive-steward-email').length).toBe(1);
		expect(ngMocks.findAll('.archive-steward-note').length).toBe(1);

		fillOutForm('test@example.com', 'Unit Testing!');

		expect(instance.email).toBe('test@example.com');
		expect(instance.note).toBe('Unit Testing!');
	});

	it('should be able to save a new directive', async () => {
		// Reset TestBed and reconfigure for this test
		TestBed.resetTestingModule();
		MockDirectiveRepo.reset();

		await TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [DirectiveEditComponent],
			providers: [
				{ provide: ApiService, useValue: new MockApiService() },
				{ provide: AccountService, useValue: new MockAccountService() },
				{ provide: MessageService, useValue: new MockMessageService() },
				EventService,
			],
		}).compileComponents();

		const fixture = TestBed.createComponent(DirectiveEditComponent);
		const instance = fixture.componentInstance;
		fixture.detectChanges();

		// Fill out form manually
		instance.email = 'test@example.com';
		instance.note = 'Test Memo';
		fixture.detectChanges();

		// Call submitForm directly and await it
		await instance.submitForm();
		fixture.detectChanges();

		// Check that form is enabled after save
		expect(instance.waiting).toBeFalse();
		expect(MockDirectiveRepo.createdDirective).not.toBeNull();
	});

	it('should be able to have existing directive data passed in', () => {
		const directive = createDirective(
			'existing@example.com',
			'already existing directive',
		);
		const fixture = MockRender(DirectiveEditComponent, { directive });
		const instance = fixture.point.componentInstance;

		expect(instance.email).toBe('existing@example.com');
		expect(instance.note).toBe('already existing directive');
	});

	it('should send an edit call if the directive already exists', async () => {
		const directive = createDirective(
			'existing@example.com',
			'already existing directive',
		);

		const fixture = MockRender(DirectiveEditComponent, { directive });
		const instance = fixture.point.componentInstance;

		fillOutForm('test@example.com', 'Test Memo');

		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();

		// Check that form is disabled during save
		expect(instance.waiting).toBeTrue();
		await fixture.whenStable();
		fixture.detectChanges();

		// Check that form is enabled after save
		expect(instance.waiting).toBeFalse();
		expect(ngMocks.find('.save-btn').nativeElement.disabled).toBeFalse();
		expect(MockDirectiveRepo.createdDirective).toBeNull();
		expect(MockDirectiveRepo.editedDirective).not.toBeNull();
	});

	it('should handle API errors on creation', async () => {
		MockDirectiveRepo.failRequest = true;
		const fixture = MockRender(DirectiveEditComponent);

		fillOutForm('test@example.com', 'Test Memo');
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(MockDirectiveRepo.createdDirective).toBeNull();
		expect(ngMocks.findAll('.account-not-found').length).toBe(0);
		expect(MockMessageService.errorShown).toBeTrue();
	});

	it('should handle API errors on editing', async () => {
		MockDirectiveRepo.failRequest = true;
		const directive = createDirective(
			'existing@example.com',
			'already existing directive',
		);
		const fixture = MockRender(DirectiveEditComponent, { directive });

		fillOutForm('test@example.com', 'Test Memo');
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(MockDirectiveRepo.editedDirective).toBeNull();
		expect(ngMocks.findAll('.account-not-found').length).toBe(0);
		expect(MockMessageService.errorShown).toBeTrue();
	});

	it('should emit an output when a directive is created', async () => {
		const fixture = MockRender(DirectiveEditComponent);
		const instance = fixture.point.componentInstance;
		let savedDirective: DirectiveData;
		instance.savedDirective.emit = jasmine
			.createSpy()
			.and.callFake((dir: DirectiveData) => {
				savedDirective = dir;
			});
		fillOutForm('test@example.com', 'Test Memo');
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(instance.savedDirective.emit).toHaveBeenCalled();
		expect(savedDirective).not.toBeUndefined();
	});

	it('should emit an output when a directive is edited', async () => {
		const directive = createDirective(
			'existing@example.com',
			'already existing directive',
		);
		const fixture = MockRender(DirectiveEditComponent, { directive });
		const instance = fixture.point.componentInstance;
		let savedDirective: DirectiveData;
		instance.savedDirective.emit = jasmine
			.createSpy()
			.and.callFake((dir: DirectiveData) => {
				savedDirective = dir;
			});
		fillOutForm('test@example.com', 'Test Memo');
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(instance.savedDirective.emit).toHaveBeenCalled();
		expect(savedDirective).not.toBeUndefined();
	});

	it('should not allow submitting a form until email is filled out', () => {
		const fixture = MockRender(DirectiveEditComponent);
		fillOutForm('  ', 'Test Memo');
		fixture.detectChanges();

		expect(ngMocks.find('.save-btn').nativeElement.disabled).toBeTruthy();
		fillOutForm('email@example.com', '');
		fixture.detectChanges();

		expect(ngMocks.find('.save-btn').nativeElement.disabled).toBeFalsy();
		fillOutForm('email@example.com', 'memo');
		fixture.detectChanges();

		expect(ngMocks.find('.save-btn').nativeElement.disabled).toBeFalsy();
	});

	it('should show an error message if a user with the given email does not exist when creating a directive', async () => {
		MockDirectiveRepo.accountExists = false;
		const fixture = MockRender(DirectiveEditComponent);
		const instance = fixture.point.componentInstance;
		const savedDirectiveSpy = spyOn(instance.savedDirective, 'emit');
		fillOutForm('notfound@example.com', 'Test Memo');

		expect(ngMocks.findAll('.account-not-found').length).toBe(0);
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.createdDirective).toBeNull();
		expect(savedDirectiveSpy).not.toHaveBeenCalled();
		expect(ngMocks.findAll('.account-not-found').length).toBe(1);
		MockDirectiveRepo.accountExists = true;
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.createdDirective).not.toBeNull();
		expect(savedDirectiveSpy).toHaveBeenCalled();
		expect(ngMocks.findAll('.account-not-found').length).toBe(0);
	});

	it('should show an error message if a user with the given email does not exist when editing', async () => {
		MockDirectiveRepo.accountExists = false;
		const directive = createDirective(
			'existing@example.com',
			'already existing directive',
		);
		const fixture = MockRender(DirectiveEditComponent, { directive });
		const instance = fixture.point.componentInstance;
		const savedDirectiveSpy = spyOn(instance.savedDirective, 'emit');
		fillOutForm('notfound@example.com', 'Test Memo');

		expect(ngMocks.findAll('.account-not-found').length).toBe(0);
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.editedDirective).toBeNull();
		expect(savedDirectiveSpy).not.toHaveBeenCalled();
		expect(ngMocks.findAll('.account-not-found').length).toBe(1);
		MockDirectiveRepo.accountExists = true;
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.editedDirective).not.toBeNull();
		expect(savedDirectiveSpy).toHaveBeenCalled();
		expect(ngMocks.findAll('.account-not-found').length).toBe(0);
	});
});
