import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { EventService } from '@shared/services/event/event.service';
import { AccountVO } from '@models/account-vo';
import { AccountSettingsComponent } from './account-settings.component';

@NgModule()
class DummyModule {}

class MockAccountService {
	public account = new AccountVO({ accountId: 1, fullName: 'Test User' });

	public getAccount(): AccountVO {
		return this.account;
	}

	public setAccount(account: AccountVO): void {
		this.account = account;
	}
}

describe('AccountSettingsComponent', () => {
	beforeEach(async () => {
		await MockBuilder(AccountSettingsComponent, DummyModule)
			.keep(HttpClientTestingModule, { export: true })
			.provide({ provide: AccountService, useClass: MockAccountService })
			.provide({ provide: ActivatedRoute, useValue: {} })
			.provide({ provide: Router, useValue: { navigate: async () => {} } })
			.provide({
				provide: PrConstantsService,
				useValue: {
					getCountries: () => [],
					getStates: () => ({}),
				},
			})
			.provide({
				provide: EventService,
				useValue: { dispatch: () => {} },
			})
			.provide({
				provide: ApiService,
				useValue: { account: { update: async () => new AccountVO({}) } },
			})
			.provide({
				provide: MessageService,
				useValue: { showMessage(_: any) {}, showError(_: any) {} },
			});
	});

	it('exists', () => {
		const fixture = MockRender(AccountSettingsComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('can save an account property', async () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		const accountService = TestBed.inject(AccountService);
		const setAccountSpy = spyOn(accountService, 'setAccount').and.callThrough();
		const accountUpdateSpy = spyOn(
			TestBed.inject(ApiService).account,
			'update',
		);
		const successfulMessageSpy = spyOn(
			TestBed.inject(MessageService),
			'showMessage',
		);
		const errorMessageSpy = spyOn(TestBed.inject(MessageService), 'showError');

		try {
			await instance.onSaveProfileInfo('fullName', 'New Name');
			await new Promise<void>((r) => {
				setTimeout(r, 0);
			});
		} finally {
			expect(setAccountSpy).toHaveBeenCalled();
			expect(accountUpdateSpy).toHaveBeenCalled();
			expect(successfulMessageSpy).toHaveBeenCalled();
			expect(errorMessageSpy).not.toHaveBeenCalled();
			expect(accountService.getAccount().fullName).toBe('New Name');
		}
	});

	it('should reset an account property if an error occurs', async () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		const accountService = TestBed.inject(AccountService);
		const setAccountSpy = spyOn(accountService, 'setAccount').and.callThrough();
		const accountUpdateSpy = spyOn(
			TestBed.inject(ApiService).account,
			'update',
		).and.rejectWith({});
		const successfulMessageSpy = spyOn(
			TestBed.inject(MessageService),
			'showMessage',
		);
		const errorMessageSpy = spyOn(TestBed.inject(MessageService), 'showError');

		try {
			await instance.onSaveProfileInfo('fullName', 'New Name');
			await new Promise<void>((r) => {
				setTimeout(r, 0);
			});
		} finally {
			expect(setAccountSpy).not.toHaveBeenCalled();
			expect(accountUpdateSpy).toHaveBeenCalled();
			expect(successfulMessageSpy).not.toHaveBeenCalled();
			expect(errorMessageSpy).toHaveBeenCalled();
			expect(accountService.getAccount().fullName).toBe('Test User');
		}
	});

	it('warns about a number that arrived from the backend, without any editing', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		expect(instance.account).toBe(TestBed.inject(AccountService).getAccount());

		instance.account.primaryPhone = '+44 20 7946 0958';
		instance.account.phoneStatus = 'status.auth.unverified';
		fixture.detectChanges();

		expect(
			ngMocks.find('.phone-number-warning').nativeElement.textContent,
		).toContain('US and Canada');
	});

	it('renders no warning for a stored number the provider can reach', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.primaryPhone = '+1 (202) 555-0147';
		instance.account.phoneStatus = 'status.auth.unverified';
		fixture.detectChanges();

		expect(ngMocks.findAll('.phone-number-warning').length).toBe(0);
	});

	it('keeps the standing guidance separate from the warning', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.primaryPhone = '416 555 0147';
		instance.account.phoneStatus = 'status.auth.unverified';
		fixture.detectChanges();

		expect(
			ngMocks.find('.settings-group-note').nativeElement.textContent,
		).toContain('Permanent only supports US and Canada numbers.');

		expect(ngMocks.findAll('.phone-number-warning').length).toBe(0);
	});

	it('warns in the same place once a typed number is long enough to judge', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.phoneStatus = 'status.auth.unverified';
		instance.onPhoneNumberEditingChange(true);
		instance.onPhoneNumberTyped('+40 748');
		fixture.detectChanges();

		expect(ngMocks.findAll('.phone-number-warning').length).toBe(0);

		instance.onPhoneNumberTyped('+40748498404');
		fixture.detectChanges();

		expect(
			ngMocks.find('.phone-number-warning').nativeElement.textContent,
		).toContain('US and Canada');
	});

	it('stays quiet while a reachable number is being typed', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.phoneStatus = 'status.auth.unverified';
		instance.onPhoneNumberEditingChange(true);

		['2', '202', '(202) 555', '(202) 555-014', '(202) 555-0147'].forEach(
			(partial) => {
				instance.onPhoneNumberTyped(partial);

				expect(instance.phoneNumberWarning).withContext(partial).toBeNull();
			},
		);
	});

	it('falls back to the stored number once editing ends', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.primaryPhone = '+44 20 7946 0958';
		instance.account.phoneStatus = 'status.auth.unverified';

		instance.onPhoneNumberEditingChange(true);
		instance.onPhoneNumberTyped('(202) 555-0147');

		expect(instance.phoneNumberWarning).toBeNull();

		instance.onPhoneNumberEditingChange(false);

		expect(instance.phoneNumberWarning).toContain('US and Canada');
	});

	it('does not warn about a number that has already verified', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.primaryPhone = '+44 20 7946 0958';
		instance.account.phoneStatus = 'status.auth.verified';

		expect(instance.phoneNumberWarning).toBeNull();

		instance.account.phoneStatus = 'status.auth.unverified';

		expect(instance.phoneNumberWarning).toContain('US and Canada');
	});

	it('does not warn about a number that was cleared', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.primaryPhone = '';

		expect(instance.phoneNumberWarning).toBeNull();

		instance.onPhoneNumberEditingChange(true);
		instance.onPhoneNumberTyped('');

		expect(instance.phoneNumberWarning).toBeNull();
	});

	it('still saves a number the provider cannot reach', async () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		const accountUpdateSpy = spyOn(
			TestBed.inject(ApiService).account,
			'update',
		).and.resolveTo(new AccountVO({}));
		const errorMessageSpy = spyOn(TestBed.inject(MessageService), 'showError');

		await instance.onSaveProfileInfo('primaryPhone', '+44 20 7946 0958');
		await new Promise<void>((resolve) => {
			setTimeout(resolve, 0);
		});

		expect(accountUpdateSpy).toHaveBeenCalled();
		expect(errorMessageSpy).not.toHaveBeenCalled();
		expect(instance.account.primaryPhone).toBe('+44 20 7946 0958');
	});

	it('should disable "Verify Phone Number" button if primaryPhone is empty', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.primaryPhone = '';
		instance.account.phoneStatus = '';
		fixture.detectChanges();

		const button = ngMocks.find('.verify-phone-button');

		expect(button.properties.disabled).toBeTrue();
	});

	it('should enable "Verify Phone Number" button if primaryPhone exists', () => {
		const fixture = MockRender(AccountSettingsComponent);
		const instance = fixture.point.componentInstance;

		instance.account.primaryPhone = '1234567890';
		instance.account.phoneStatus = '';
		fixture.detectChanges();

		const button = ngMocks.find('.verify-phone-button');

		expect(button.properties.disabled).toBeFalse();
	});
});
