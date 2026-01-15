import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@root/app/models';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '../../../shared/services/api/api.service';
import { AdvancedSettingsComponent } from './advanced-settings.component';

@NgModule()
class DummyModule {}

const mockAccountService = {
	getAccount: () => new AccountVO({ accountId: 1, allowSftpDeletion: true }),
	setAccount: (account: AccountVO) => {},
};

const mockApiService = {
	account: {
		update: async (account: AccountVO) => await Promise.resolve(account),
	},
};

describe('AdvancedSettingsComponent', () => {
	let messageShown = false;

	beforeEach(async () => {
		messageShown = false;
		await MockBuilder(AdvancedSettingsComponent, DummyModule)
			.provide({
				provide: MessageService,
				useValue: {
					showError: () => {
						messageShown = true;
					},
				},
			})
			.provide({
				provide: ApiService,
				useValue: mockApiService,
			})
			.provide({
				provide: AccountService,
				useValue: mockAccountService,
			});
	});

	it('should create', () => {
		const fixture = MockRender(AdvancedSettingsComponent);

		expect(fixture.point.componentInstance).not.toBeNull();
	});

	it('initializes allowSFTPDeletion from the account service', () => {
		const fixture = MockRender(AdvancedSettingsComponent);

		expect(fixture.point.componentInstance.allowSFTPDeletion).toEqual(1);
	});

	it('updates account on calling onAllowSFTPDeletion', async () => {
		const fixture = MockRender(AdvancedSettingsComponent);
		const apiService = TestBed.inject(ApiService);
		const spy = spyOn(apiService.account, 'update').and.resolveTo(
			new AccountVO({}),
		);

		await fixture.point.componentInstance.onAllowSFTPDeletion();

		expect(spy).toHaveBeenCalled();
	});

	it('handles errors in onAllowSFTPDeletion', async () => {
		const fixture = MockRender(AdvancedSettingsComponent);
		const apiService = TestBed.inject(ApiService);

		spyOn(apiService.account, 'update').and.throwError('test error');

		await fixture.point.componentInstance.onAllowSFTPDeletion();

		expect(messageShown).toBe(true);
	});
});
