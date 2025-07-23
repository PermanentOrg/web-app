/* @format */
import { SharedModule } from '@shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Shallow } from 'shallow-render';
import { MobileBannerService } from '@shared/services/mobile-banner/mobile-banner.service';
import { MobileBannerComponent } from './mobile-banner.component';

const mockBannerService = {
	get isIos() {
		return true;
	},
	get isVisible() {
		return true;
	},
	get appStoreUrl() {
		return 'appStoreUrl';
	},
	get playStoreUrl() {
		return 'playStoreUrl';
	},
	hideBanner() {},
};

describe('MobileBannerComponent', () => {
	let shallow: Shallow<MobileBannerComponent>;

	beforeEach(() => {
		shallow = new Shallow(MobileBannerComponent, SharedModule)
			.mock(MobileBannerService, mockBannerService)
			.dontMock(NoopAnimationsModule)
			.import(NoopAnimationsModule);
	});

	it('should exist', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should initialize with correct visibility and URL', async () => {
		const { instance } = await shallow.render();

		expect(instance.bannerService.isVisible).toBe(mockBannerService.isVisible);

		expect(instance.url).toBe(
			mockBannerService.isIos
				? mockBannerService.appStoreUrl
				: mockBannerService.playStoreUrl,
		);
	});

	it('should display the banner if visible', async () => {
		const { find } = await shallow.render();

		expect(find('.banner')).toHaveFoundOne();
	});

	it('should use the correct URL based on platform', async () => {
		const { instance } = await shallow.render();
		if (instance.bannerService.isIos) {
			expect(instance.url).toBe(mockBannerService.appStoreUrl);
		} else {
			expect(instance.url).toBe(mockBannerService.playStoreUrl);
		}
	});

	it('should close the banner when close icon is clicked', async () => {
		spyOn(mockBannerService, 'hideBanner');
		const mockEvent = { stopPropagation: () => {} };
		const { find } = await shallow.render();
		find('.material-icons').triggerEventHandler('click', mockEvent);

		expect(mockBannerService.hideBanner).toHaveBeenCalled();
	});
});
