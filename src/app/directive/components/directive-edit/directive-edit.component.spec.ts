import { DebugElement, Type } from '@angular/core';
import { DirectiveData } from '@models/directive';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { Shallow } from 'shallow-render';
import { QueryMatch } from 'shallow-render/dist/lib/models/query-match';
import { EventService } from '@shared/services/event/event.service';
import { PermanentEvent } from '@shared/services/event/event-types';
import { MessageService } from '@shared/services/message/message.service';
import { DirectiveModule } from '../../directive.module';
import { MockAccountService } from '../directive-display/test-utils';
import { DirectiveEditComponent } from './directive-edit.component';
import {
	MockDirectiveRepo,
	MockMessageService,
	createDirective,
} from './test-utils';

class MockApiService {
	public directive = new MockDirectiveRepo();
}

type Find = (
	cssOrDirective: string | Type<any>,
	options?: {
		query?: string;
	},
) => QueryMatch<DebugElement>;

describe('DirectiveEditComponent', () => {
	let shallow: Shallow<DirectiveEditComponent>;

	const fillOutForm = (find: Find, email: string, note: string) => {
		const emailInput = find('.archive-steward-email')[0]
			.nativeElement as HTMLInputElement;
		const noteInput = find('.archive-steward-note')[0]
			.nativeElement as HTMLTextAreaElement;

		emailInput.value = email;
		emailInput.dispatchEvent(new Event('input'));
		noteInput.value = note;
		noteInput.dispatchEvent(new Event('input'));
	};

	beforeEach(() => {
		MockDirectiveRepo.reset();
		MockMessageService.reset();
		shallow = new Shallow<DirectiveEditComponent>(
			DirectiveEditComponent,
			DirectiveModule,
		)
			.provideMock([
				{
					provide: ApiService,
					useClass: MockApiService,
				},
			])
			.provideMock([
				{
					provide: AccountService,
					useClass: MockAccountService,
				},
			])
			.provideMock([
				{
					provide: MessageService,
					useClass: MockMessageService,
				},
			])
			.provide(EventService)
			.dontMock(EventService);
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).not.toBeNull();
	});

	it('should be able to fill out the directive form', async () => {
		const { instance, find } = await shallow.render();

		expect(find('.archive-steward-email').length).toBe(1);
		expect(find('.archive-steward-note').length).toBe(1);

		fillOutForm(find, 'test@example.com', 'Unit Testing!');

		expect(instance.email).toBe('test@example.com');
		expect(instance.note).toBe('Unit Testing!');
	});

	it('should be able to save a new directive', async () => {
		const { instance, find, fixture } = await shallow.render();

		fillOutForm(find, 'test@example.com', 'Test Memo');

		expect(find('.save-btn').length).toBe(1);
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();

		expect(find('*[disabled], *[readonly]').length).toBe(3);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(find('*[disabled], *[readonly]').length).toBe(0);

		expect(find('.account-not-found').length).toBe(0);
		expect(MockDirectiveRepo.createdDirective).not.toBeNull();
	});

	it('should be able to have existing directive data passed in', async () => {
		const directive = await createDirective(
			'existing@example.com',
			'already existing directive',
		);
		const { instance } = await shallow.render({
			bind: {
				directive,
			},
		});

		expect(instance.email).toBe('existing@example.com');
		expect(instance.note).toBe('already existing directive');
	});

	it('should send an edit call if the directive already exists', async () => {
		const directive = await createDirective(
			'existing@example.com',
			'already existing directive',
		);

		const { find, fixture } = await shallow.render({
			bind: {
				directive,
			},
		});

		fillOutForm(find, 'test@example.com', 'Test Memo');

		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();

		expect(find('*[disabled], *[readonly]').length).toBe(3);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(find('*[disabled], *[readonly]').length).toBe(0);
		expect(MockDirectiveRepo.createdDirective).toBeNull();
		expect(MockDirectiveRepo.editedDirective).not.toBeNull();
	});

	it('should handle API errors on creation', async () => {
		MockDirectiveRepo.failRequest = true;
		const { instance, find, fixture } = await shallow.render();

		fillOutForm(find, 'test@example.com', 'Test Memo');
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(MockDirectiveRepo.createdDirective).toBeNull();
		expect(find('.account-not-found').length).toBe(0);
		expect(MockMessageService.errorShown).toBeTrue();
	});

	it('should handle API errors on editing', async () => {
		MockDirectiveRepo.failRequest = true;
		const directive = await createDirective(
			'existing@example.com',
			'already existing directive',
		);
		const { find, fixture } = await shallow.render({
			bind: {
				directive,
			},
		});

		fillOutForm(find, 'test@example.com', 'Test Memo');
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(MockDirectiveRepo.editedDirective).toBeNull();
		expect(find('.account-not-found').length).toBe(0);
		expect(MockMessageService.errorShown).toBeTrue();
	});

	it('should emit an output when a directive is created', async () => {
		const { find, fixture, instance } = await shallow.render();
		let savedDirective: DirectiveData;
		instance.savedDirective.emit = jasmine
			.createSpy()
			.and.callFake((dir: DirectiveData) => {
				savedDirective = dir;
			});
		fillOutForm(find, 'test@example.com', 'Test Memo');
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(instance.savedDirective.emit).toHaveBeenCalled();
		expect(savedDirective).not.toBeUndefined();
	});

	it('should emit an output when a directive is edited', async () => {
		const directive = await createDirective(
			'existing@example.com',
			'already existing directive',
		);
		const { instance, find, fixture } = await shallow.render({
			bind: {
				directive,
			},
		});
		let savedDirective: DirectiveData;
		instance.savedDirective.emit = jasmine
			.createSpy()
			.and.callFake((dir: DirectiveData) => {
				savedDirective = dir;
			});
		fillOutForm(find, 'test@example.com', 'Test Memo');
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();
		await fixture.whenStable();

		expect(instance.savedDirective.emit).toHaveBeenCalled();
		expect(savedDirective).not.toBeUndefined();
	});

	it('should not allow submitting a form until email is filled out', async () => {
		const { find, fixture } = await shallow.render();
		fillOutForm(find, '  ', 'Test Memo');
		fixture.detectChanges();

		expect(find('.save-btn').nativeElement.disabled).toBeTruthy();
		fillOutForm(find, 'email@example.com', '');
		fixture.detectChanges();

		expect(find('.save-btn').nativeElement.disabled).toBeFalsy();
		fillOutForm(find, 'email@example.com', 'memo');
		fixture.detectChanges();

		expect(find('.save-btn').nativeElement.disabled).toBeFalsy();
	});

	it('should show an error message if a user with the given email does not exist when creating a directive', async () => {
		MockDirectiveRepo.accountExists = false;
		const { find, fixture, outputs } = await shallow.render();
		fillOutForm(find, 'notfound@example.com', 'Test Memo');

		expect(find('.account-not-found').length).toBe(0);
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.createdDirective).toBeNull();
		expect(outputs.savedDirective.emit).not.toHaveBeenCalled();
		expect(find('.account-not-found').length).toBe(1);
		MockDirectiveRepo.accountExists = true;
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.createdDirective).not.toBeNull();
		expect(outputs.savedDirective.emit).toHaveBeenCalled();
		expect(find('.account-not-found').length).toBe(0);
	});

	it('should show an error message if a user with the given email does not exist when editing', async () => {
		MockDirectiveRepo.accountExists = false;
		const directive = await createDirective(
			'existing@example.com',
			'already existing directive',
		);
		const { find, fixture, outputs } = await shallow.render({
			bind: { directive },
		});
		fillOutForm(find, 'notfound@example.com', 'Test Memo');

		expect(find('.account-not-found').length).toBe(0);
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.editedDirective).toBeNull();
		expect(outputs.savedDirective.emit).not.toHaveBeenCalled();
		expect(find('.account-not-found').length).toBe(1);
		MockDirectiveRepo.accountExists = true;
		find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.editedDirective).not.toBeNull();
		expect(outputs.savedDirective.emit).toHaveBeenCalled();
		expect(find('.account-not-found').length).toBe(0);
	});
});
