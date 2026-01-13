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
