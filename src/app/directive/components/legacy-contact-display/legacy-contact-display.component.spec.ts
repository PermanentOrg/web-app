import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { MockAccountService } from '../directive-display/test-utils';
import { MockMessageService } from '../directive-edit/test-utils';
import { LegacyContactDisplayComponent } from './legacy-contact-display.component';
import { MockApiService, MockDirectiveRepo } from './test-utils';

@NgModule()
class DummyModule {}

describe('LegacyContactDisplayComponent', () => {
	beforeEach(async () => {
		MockDirectiveRepo.reset();
		MockMessageService.reset();
		await MockBuilder(LegacyContactDisplayComponent, DummyModule)
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
			});
	});

	it('should create', () => {
		const fixture = MockRender(LegacyContactDisplayComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('should list legacy contact information', async () => {
		MockDirectiveRepo.legacyContactName = 'Test User';
		MockDirectiveRepo.legacyContactEmail = 'test@example.com';
		const fixture = MockRender(LegacyContactDisplayComponent);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(ngMocks.findAll('.legacy-contact-name').length).toBe(1);
		expect(
			ngMocks.findAll('.legacy-contact-name')[0].nativeElement.innerText,
		).toContain('Test User');

		expect(ngMocks.findAll('.legacy-contact-email').length).toBe(1);
		expect(
			ngMocks.findAll('.legacy-contact-email')[0].nativeElement.innerText,
		).toContain('test@example.com');

		expect(ngMocks.findAll('.not-assigned').length).toBe(0);
	});

	it('should show "not assigned" if no legacy contact', async () => {
		const fixture = MockRender(LegacyContactDisplayComponent);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(
			ngMocks.findAll('.legacy-contact-name')[0].nativeElement.innerText,
		).toContain('not assigned');

		expect(
			ngMocks.findAll('.legacy-contact-email')[0].nativeElement.innerText,
		).toContain('not assigned');

		expect(ngMocks.findAll('.not-assigned').length).toBe(2);
	});

	it('should show an error message if there was an error fetching legacy contact', async () => {
		MockDirectiveRepo.throwError = true;
		const fixture = MockRender(LegacyContactDisplayComponent);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(ngMocks.findAll('.legacy-contact-name').length).toBe(0);
		expect(ngMocks.findAll('.legacy-contact-email').length).toBe(0);
		expect(ngMocks.findAll('.error').length).toBe(1);
	});

	it('should emit an event when the edit button is pressed', () => {
		const fixture = MockRender(LegacyContactDisplayComponent);
		const instance = fixture.point.componentInstance;
		const beginEditSpy = spyOn(instance.beginEdit, 'emit');
		ngMocks.find('button').nativeElement.dispatchEvent(new Event('click'));

		expect(beginEditSpy).toHaveBeenCalled();
	});

	it('should emit an event when the legacy contact is fetched', async () => {
		const fixture = MockRender(LegacyContactDisplayComponent);
		const instance = fixture.point.componentInstance;
		const loadedLegacyContactSpy = spyOn(instance.loadedLegacyContact, 'emit');
		await fixture.whenStable();

		expect(loadedLegacyContactSpy).toHaveBeenCalled();
	});
});
