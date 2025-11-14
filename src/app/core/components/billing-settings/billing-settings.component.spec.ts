import { Shallow } from 'shallow-render';
import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountVO } from '@models/account-vo';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
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
	let shallow: Shallow<BillingSettingsComponent>;

	beforeEach(() => {
		shallow = new Shallow(BillingSettingsComponent, DummyModule)
			.provide(HttpClientTestingModule)
			.provideMock(
				{ provide: AccountService, useClass: MockAccountService },
				{
					provide: ApiService,
					useValue: { account: { update: async () => new AccountVO({}) } },
				},
				{
					provide: MessageService,
					useValue: { showMessage(_: any) {}, showError(_: any) {} },
				},
			);
	});

	it('exists', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('can save an account property', async () => {
		const { instance, inject } = await shallow.render();

		const accountService = inject(AccountService);
		const setAccountSpy = spyOn(accountService, 'setAccount').and.callThrough();
		const accountUpdateSpy = spyOn(
			inject(ApiService).account,
			'update',
		).and.resolveTo(new AccountVO({ zip: null }));
		const successfulMessageSpy = spyOn(inject(MessageService), 'showMessage');
		const errorMessageSpy = spyOn(inject(MessageService), 'showError');

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
		const { instance, inject } = await shallow.render();

		const accountService = inject(AccountService);
		const setAccountSpy = spyOn(accountService, 'setAccount').and.callThrough();
		const accountUpdateSpy = spyOn(
			inject(ApiService).account,
			'update',
		).and.rejectWith({});
		const successfulMessageSpy = spyOn(inject(MessageService), 'showMessage');
		const errorMessageSpy = spyOn(inject(MessageService), 'showError');

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
