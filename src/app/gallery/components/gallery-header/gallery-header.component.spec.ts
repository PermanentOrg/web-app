/* @format */
import { Shallow } from 'shallow-render';
import { NgModule } from '@angular/core';

import { AccountService } from '@shared/services/account/account.service';
import { AccountDropdownComponent } from '@shared/components/account-dropdown/account-dropdown.component';
import { GalleryHeaderComponent } from './gallery-header.component';

@NgModule({
	declarations: [GalleryHeaderComponent, AccountDropdownComponent], // components your module owns.
	imports: [], // other modules your module needs.
	providers: [AccountService], // providers available to your module.
	bootstrap: [], // bootstrap this root component.
})
class DummyModule {}

let isLoggedIn: boolean;
const accountMock = {
	isLoggedIn: () => isLoggedIn,
};

describe('GalleryHeaderComponent', () => {
	let shallow: Shallow<GalleryHeaderComponent>;

	const defaultRender = async () =>
		await shallow.render('<pr-gallery-header></pr-gallery-header>', {
			bind: {
				isLoggedIn,
			},
		});
	beforeEach(() => {
		isLoggedIn = true;
		shallow = new Shallow(GalleryHeaderComponent, DummyModule).mock(
			AccountService,
			accountMock,
		);
	});

	it('should render', async () => {
		const { element } = await defaultRender();

		expect(element).not.toBeNull();
	});

	it('should render back button when logged in', async () => {
		const { find, element, fixture } = await defaultRender();

		expect(find('.return-btn').length).toBeGreaterThan(0);
	});
});
