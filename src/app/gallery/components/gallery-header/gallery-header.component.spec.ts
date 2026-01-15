import { NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { AccountService } from '@shared/services/account/account.service';
import { AccountDropdownComponent } from '@shared/components/account-dropdown/account-dropdown.component';
import { GalleryHeaderComponent } from './gallery-header.component';

@NgModule({
	declarations: [GalleryHeaderComponent, AccountDropdownComponent],
	imports: [],
	providers: [AccountService],
	bootstrap: [],
})
class DummyModule {}

let isLoggedIn: boolean;
const accountMock = {
	isLoggedIn: () => isLoggedIn,
};

describe('GalleryHeaderComponent', () => {
	beforeEach(async () => {
		isLoggedIn = true;
		await MockBuilder(GalleryHeaderComponent, DummyModule).provide({
			provide: AccountService,
			useValue: accountMock,
		});
	});

	function defaultRender() {
		return MockRender('<pr-gallery-header></pr-gallery-header>', {
			isLoggedIn,
		});
	}

	it('should render', () => {
		const fixture = defaultRender();

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should render back button when logged in', () => {
		defaultRender();

		expect(ngMocks.findAll('.return-btn').length).toBeGreaterThan(0);
	});
});
