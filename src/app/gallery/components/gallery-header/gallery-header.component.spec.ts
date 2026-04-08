import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { AccountService } from '@shared/services/account/account.service';
import { GalleryModule } from '../../gallery.module';
import { GalleryHeaderComponent } from './gallery-header.component';

let isLoggedIn: boolean;
const accountMock = {
	isLoggedIn: () => isLoggedIn,
};

describe('GalleryHeaderComponent', () => {
	beforeEach(async () => {
		isLoggedIn = true;
		await MockBuilder(GalleryHeaderComponent, GalleryModule).provide({
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
