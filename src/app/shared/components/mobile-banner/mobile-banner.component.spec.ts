import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBuilder, ngMocks } from 'ng-mocks';
import { SharedModule } from '@shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
	let fixture: ComponentFixture<MobileBannerComponent>;
	let instance: MobileBannerComponent;

	beforeEach(async () => {
		await MockBuilder(MobileBannerComponent, SharedModule)
			.mock(MobileBannerService, mockBannerService)
			.keep(NoopAnimationsModule, { export: true });

		fixture = TestBed.createComponent(MobileBannerComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should exist', () => {
		expect(instance).toBeTruthy();
	});

	it('should initialize with correct visibility and URL', () => {
		expect(instance.bannerService.isVisible).toBe(mockBannerService.isVisible);

		expect(instance.url).toBe(
			mockBannerService.isIos
				? mockBannerService.appStoreUrl
				: mockBannerService.playStoreUrl,
		);
	});

	it('should display the banner if visible', () => {
		const banners = ngMocks.findAll('.banner');

		expect(banners).toHaveFoundOne();
	});

	it('should use the correct URL based on platform', () => {
		if (instance.bannerService.isIos) {
			expect(instance.url).toBe(mockBannerService.appStoreUrl);
		} else {
			expect(instance.url).toBe(mockBannerService.playStoreUrl);
		}
	});

	it('should close the banner when close icon is clicked', () => {
		spyOn(instance.bannerService, 'hideBanner');
		const mockEvent = { stopPropagation: () => {} };
		const closeIcon = ngMocks.find('.material-icons');
		closeIcon.triggerEventHandler('click', mockEvent);

		expect(instance.bannerService.hideBanner).toHaveBeenCalled();
	});
});
