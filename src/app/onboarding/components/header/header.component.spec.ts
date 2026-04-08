import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { OnboardingHeaderComponent } from './header.component';

import { vi } from 'vitest';

@NgModule()
class DummyModule {}

class AccountClearStub {
	public clear() {}
}

describe('OnboardingHeaderComponent', () => {
	beforeEach(async () => {
		await MockBuilder(OnboardingHeaderComponent, DummyModule).provide({
			provide: AccountService,
			useClass: AccountClearStub,
		});
	});

	it('should create', () => {
		const fixture = MockRender(OnboardingHeaderComponent, {
			accountName: 'Unit Test',
		});

		expect(fixture.point.componentInstance).toBeTruthy();
	});

	it("should display the user's name", () => {
		const fixture = MockRender(OnboardingHeaderComponent, {
			accountName: 'Unit Test',
		});

		expect(fixture.nativeElement.innerText).toContain('Unit Test');
	});

	it('can log out the user', () => {
		MockRender(OnboardingHeaderComponent, {
			accountName: 'Unit Test',
		});

		const accountService = ngMocks.get(AccountService);
		const router = ngMocks.get(Router);
		const accountClearSpy = vi.spyOn(accountService, 'clear');
		const navigateSpy = vi.spyOn(router, 'navigate');
		ngMocks.find('.banner-logout button').triggerEventHandler('click', null);

		expect(accountClearSpy).toHaveBeenCalled();
		expect(navigateSpy).toHaveBeenCalled();
	});
});
