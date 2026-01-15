import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { DeviceService } from '@shared/services/device/device.service';
import { MobileBannerService } from './mobile-banner.service';

const mockAndroidDeviceService = {
	isAndroid: () => true,
	isIos: () => false,
};
const mockIosDeviceService = {
	isAndroid: () => false,
	isIos: () => true,
};

describe('BannerService', () => {
	describe('when on an Android device', () => {
		beforeEach(async () => {
			await MockBuilder(MobileBannerService).provide({
				provide: DeviceService,
				useValue: mockAndroidDeviceService,
			});
		});

		it('should be visible on Android', () => {
			const instance = TestBed.inject(MobileBannerService);

			expect(instance.isVisible).toBeTrue();

			expect(instance.isIos).toBeFalse();
		});
	});

	describe('when on an iOS device', () => {
		beforeEach(async () => {
			await MockBuilder(MobileBannerService).provide({
				provide: DeviceService,
				useValue: mockIosDeviceService,
			});
		});

		it('should be visible on iOS', () => {
			const instance = TestBed.inject(MobileBannerService);

			expect(instance.isVisible).toBeTrue();

			expect(instance.isIos).toBeTrue();
		});
	});
});
