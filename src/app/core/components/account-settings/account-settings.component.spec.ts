import { Shallow } from 'shallow-render';
import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
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
	let shallow: Shallow<AccountSettingsComponent>;

	beforeEach(() => {
		shallow = new Shallow(AccountSettingsComponent, DummyModule)
			.provide(HttpClientTestingModule)
			.provideMock(
				{ provide: AccountService, useClass: MockAccountService },
				{ provide: ActivatedRoute, useValue: {} },
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

	it('can save an account property', async (done) => {
		const { instance, inject } = await shallow.render();

		const accountService = inject(AccountService);
		const setAccountSpy = spyOn(accountService, 'setAccount').and.callThrough();
		const accountUpdateSpy = spyOn(inject(ApiService).account, 'update');
		const successfulMessageSpy = spyOn(inject(MessageService), 'showMessage');
		const errorMessageSpy = spyOn(inject(MessageService), 'showError');

		instance.onSaveProfileInfo('fullName', 'New Name').finally(() => {
			expect(setAccountSpy).toHaveBeenCalled();
			expect(accountUpdateSpy).toHaveBeenCalled();
			expect(successfulMessageSpy).toHaveBeenCalled();
			expect(errorMessageSpy).not.toHaveBeenCalled();
			expect(accountService.getAccount().fullName).toBe('New Name');
			done();
		});
	});

	it('should reset an account property if an error occurs', async (done) => {
		const { instance, inject } = await shallow.render();

		const accountService = inject(AccountService);
		const setAccountSpy = spyOn(accountService, 'setAccount').and.callThrough();
		const accountUpdateSpy = spyOn(
			inject(ApiService).account,
			'update',
		).and.rejectWith({});
		const successfulMessageSpy = spyOn(inject(MessageService), 'showMessage');
		const errorMessageSpy = spyOn(inject(MessageService), 'showError');

		instance.onSaveProfileInfo('fullName', 'New Name').finally(() => {
			expect(setAccountSpy).not.toHaveBeenCalled();
			expect(accountUpdateSpy).toHaveBeenCalled();
			expect(successfulMessageSpy).not.toHaveBeenCalled();
			expect(errorMessageSpy).toHaveBeenCalled();
			expect(accountService.getAccount().fullName).toBe('Test User');
			done();
		});
	});

	it('should disable "Verify Phone Number" button if primaryPhone is empty', async () => {
		const { find, instance, fixture } = await shallow.render();

		instance.account.primaryPhone = '';
		instance.account.phoneStatus = '';
		fixture.detectChanges();

		const button = find('.verify-phone-button');

		expect(button.properties['disabled']).toBeTrue();
	});

	it('should enable "Verify Phone Number" button if primaryPhone exists', async () => {
		const { find, instance, fixture } = await shallow.render();

		instance.account.primaryPhone = '1234567890';
		instance.account.phoneStatus = '';
		fixture.detectChanges();

		const button = find('.verify-phone-button');

		expect(button.properties['disabled']).toBeFalse();
	});
});
