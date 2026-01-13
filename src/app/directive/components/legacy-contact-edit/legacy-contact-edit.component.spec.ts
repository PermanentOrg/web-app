import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FormsModule } from '@angular/forms';
import { LegacyContact } from '@models/directive';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { EventService } from '@shared/services/event/event.service';
import { MockDirectiveRepo } from '../legacy-contact-display/test-utils';
import { MockMessageService } from '../directive-edit/test-utils';
import { LegacyContactEditComponent } from './legacy-contact-edit.component';

@NgModule()
class DummyModule {}

class MockApiService {
	public directive = new MockDirectiveRepo();
}

describe('LegacyContactEditComponent', () => {
	const fillOutForm = (email: string, name: string) => {
		const emailInput = ngMocks.findAll('.legacy-contact-email')[0]
			.nativeElement as HTMLInputElement;
		const nameInput = ngMocks.findAll('.legacy-contact-name')[0]
			.nativeElement as HTMLTextAreaElement;

		emailInput.value = email;
		emailInput.dispatchEvent(new Event('input'));
		nameInput.value = name;
		nameInput.dispatchEvent(new Event('input'));
	};

	beforeEach(async () => {
		MockDirectiveRepo.reset();
		MockMessageService.reset();
		await MockBuilder(LegacyContactEditComponent, DummyModule)
			.keep(FormsModule, { export: true })
			.provide({
				provide: ApiService,
				useClass: MockApiService,
			})
			.provide({
				provide: MessageService,
				useClass: MockMessageService,
			})
			.keep(EventService);
	});

	it('should create', () => {
		const fixture = MockRender(LegacyContactEditComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('should be able to fill out legacy contact form', () => {
		const fixture = MockRender(LegacyContactEditComponent);
		const instance = fixture.point.componentInstance;

		expect(ngMocks.findAll('.legacy-contact-name').length).toBe(1);
		expect(ngMocks.findAll('.legacy-contact-email').length).toBe(1);

		fillOutForm('test@example.com', 'Unit Testing');

		expect(instance.name).toBe('Unit Testing');
		expect(instance.email).toBe('test@example.com');
	});

	it('should be able to save a legacy contact', async () => {
		const fixture = MockRender(LegacyContactEditComponent);

		fillOutForm('save@example.com', 'Save Test');

		expect(ngMocks.findAll('.save-btn').length).toBe(1);
		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		fixture.detectChanges();

		expect(ngMocks.findAll('*[disabled]').length).toBe(3);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(ngMocks.findAll('*[disabled]').length).toBe(0);

		expect(MockDirectiveRepo.savedLegacyContact.email).toBe('save@example.com');
		expect(MockDirectiveRepo.savedLegacyContact.name).toBe('Save Test');
		expect(MockDirectiveRepo.createdLegacyContact).toBeTrue();
	});

	it('should be able to have existing legacy contact data passed in', () => {
		const legacyContact: LegacyContact = {
			name: 'Existing Contact',
			email: 'existing@example.com',
		};
		const fixture = MockRender(LegacyContactEditComponent, { legacyContact });
		const instance = fixture.point.componentInstance;

		expect(instance.email).toBe('existing@example.com');
		expect(instance.name).toBe('Existing Contact');
	});

	it('should make an update call if the legacy contact already exists', async () => {
		const legacyContact: LegacyContact = {
			name: 'Existing Contact',
			email: 'existing@example.com',
		};
		const fixture = MockRender(LegacyContactEditComponent, { legacyContact });

		fillOutForm('existing@example.com', 'Existing Updated Contact');

		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockDirectiveRepo.savedLegacyContact.name).toBe(
			'Existing Updated Contact',
		);

		expect(MockDirectiveRepo.createdLegacyContact).toBeFalse();
		expect(MockDirectiveRepo.updatedLegacyContact).toBeTrue();
	});

	it('should handle API errors on creation', async () => {
		MockDirectiveRepo.throwError = true;
		const fixture = MockRender(LegacyContactEditComponent);

		fillOutForm('error@example.com', 'Throw Error');

		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockMessageService.errorShown).toBeTrue();
		expect(MockDirectiveRepo.savedLegacyContact).toBeUndefined();
	});

	it('should handle API errors on editing', async () => {
		MockDirectiveRepo.throwError = true;
		const legacyContact: LegacyContact = {
			name: 'Test',
			email: 'test@example.com',
		};
		const fixture = MockRender(LegacyContactEditComponent, { legacyContact });

		fillOutForm('error@example.com', 'Throw Error');

		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(MockMessageService.errorShown).toBeTrue();
		expect(MockDirectiveRepo.savedLegacyContact).toBeUndefined();
	});

	it('should emit an output after saving (creation)', async () => {
		const fixture = MockRender(LegacyContactEditComponent);
		const instance = fixture.point.componentInstance;
		const savedLegacyContactSpy = spyOn(instance.savedLegacyContact, 'emit');

		fillOutForm('output@example.com', 'Test Output');

		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(savedLegacyContactSpy).toHaveBeenCalled();
	});

	it('should emit an output after saving (update)', async () => {
		const fixture = MockRender(LegacyContactEditComponent, {
			legacyContact: {
				id: '1',
				name: 'Test Output',
				email: 'output@example.com',
			},
		});
		const instance = fixture.point.componentInstance;
		const savedLegacyContactSpy = spyOn(instance.savedLegacyContact, 'emit');

		fillOutForm('output@example.com', 'Test Update Output');

		ngMocks.find('.save-btn').nativeElement.dispatchEvent(new Event('click'));
		await fixture.whenStable();
		fixture.detectChanges();

		expect(savedLegacyContactSpy).toHaveBeenCalled();
	});

	it('should not allow the form to submit until all fields are filled out', () => {
		const fixture = MockRender(LegacyContactEditComponent);

		expect(ngMocks.findAll('.save-btn[disabled]').length).toBe(1);

		fillOutForm('', 'Test No Submit');
		fixture.detectChanges();

		expect(ngMocks.findAll('.save-btn[disabled]').length).toBe(1);

		fillOutForm('no-submit@example.com', '');
		fixture.detectChanges();

		expect(ngMocks.findAll('.save-btn[disabled]').length).toBe(1);

		fillOutForm('submit@example.com', 'Submit Now Works');
		fixture.detectChanges();

		expect(ngMocks.findAll('.save-btn[disabled]').length).toBe(0);
	});
});
