import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountVO } from '@models/account-vo';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { EventService } from '@shared/services/event/event.service';
import { BillingSettingsComponent } from './billing-settings.component';

@NgModule()
class DummyModule {}

class MockAccountService {
	public account = new AccountVO({
		accountId: 1,
		fullName: 'Test User',
		zip: '12345',
	});

	public getAccount(): AccountVO {
		return this.account;
	}

	public setAccount(account: AccountVO): void {
		this.account = account;
	}
}

describe('BillingSettingsComponent', () => {
	beforeEach(async () => {
		await MockBuilder(BillingSettingsComponent, DummyModule)
			.keep(HttpClientTestingModule, { export: true })
			.provide({ provide: AccountService, useClass: MockAccountService })
			.provide({
				provide: ApiService,
				useValue: { account: { update: async () => new AccountVO({}) } },
			})
			.provide({
				provide: MessageService,
				useValue: { showMessage(_: any) {}, showError(_: any) {} },
			})
			.provide({
				provide: PrConstantsService,
				useValue: { getCountries: () => [], getStates: () => ({}) },
			})
			.provide({
				provide: EventService,
				useValue: { dispatch: () => {} },
			});
	});

	it('exists', () => {
		const fixture = MockRender(BillingSettingsComponent);

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it('can save an account property', async () => {
		const fixture = MockRender(BillingSettingsComponent);
		const instance = fixture.point.componentInstance;

		const accountService = TestBed.inject(AccountService);
		const setAccountSpy = spyOn(accountService, 'setAccount').and.callThrough();
		const accountUpdateSpy = spyOn(
			TestBed.inject(ApiService).account,
			'update',
		).and.resolveTo(new AccountVO({ zip: null }));
		const successfulMessageSpy = spyOn(
			TestBed.inject(MessageService),
			'showMessage',
		);
		const errorMessageSpy = spyOn(TestBed.inject(MessageService), 'showError');

		try {
			await instance.onSaveInfo('fullName', 'New Name');
			await new Promise<void>((r) => {
				setTimeout(r, 0);
			});
		} finally {
			expect(setAccountSpy).toHaveBeenCalled();
			expect(accountUpdateSpy).toHaveBeenCalled();
			expect(successfulMessageSpy).toHaveBeenCalled();
			expect(errorMessageSpy).not.toHaveBeenCalled();
			expect(accountService.getAccount().fullName).toBe('New Name');
			expect(accountService.getAccount().zip).toBe('12345');
		}
	});

	it('should reset an account property if an error occurs', async () => {
		const fixture = MockRender(BillingSettingsComponent);
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
			await instance.onSaveInfo('fullName', 'New Name');
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
});
