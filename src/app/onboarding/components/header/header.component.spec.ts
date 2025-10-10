import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { OnboardingModule } from '../../onboarding.module';
import { OnboardingHeaderComponent } from './header.component';

class AccountClearStub {
	public clear() {}
}

describe('OnboardingHeaderComponent', () => {
	let shallow: Shallow<OnboardingHeaderComponent>;

	async function defaultRender(accountName: string = 'Unit Test') {
		return await shallow.render({
			bind: {
				accountName,
			},
		});
	}

	beforeEach(async () => {
		shallow = new Shallow(
			OnboardingHeaderComponent,
			OnboardingModule,
		).provideMock({ provide: AccountService, useClass: AccountClearStub });
	});

	it('should create', async () => {
		const { instance } = await defaultRender();

		expect(instance).toBeTruthy();
	});

	it("should display the user's name", async () => {
		const { element } = await defaultRender();

		expect(element.nativeElement.innerText).toContain('Unit Test');
	});

	it('can log out the user', async () => {
		const { find, inject } = await defaultRender();

		const accountClearSpy = spyOn(inject(AccountService), 'clear');
		const navigateSpy = spyOn(inject(Router), 'navigate');
		find('.banner-logout button').triggerEventHandler('click');

		expect(accountClearSpy).toHaveBeenCalled();
		expect(navigateSpy).toHaveBeenCalled();
	});
});
