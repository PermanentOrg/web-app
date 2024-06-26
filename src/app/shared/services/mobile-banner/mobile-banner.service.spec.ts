/* @format */
import { DeviceService } from '@shared/services/device/device.service';
import { CoreModule } from '@core/core.module';
import { Shallow } from 'shallow-render';
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
  let shallow: Shallow<MobileBannerService>;

  describe('when on an Android device', () => {
    beforeEach(() => {
      shallow = new Shallow(MobileBannerService, CoreModule).mock(
        DeviceService,
        mockAndroidDeviceService,
      );
    });

    it('should be visible on Android', async () => {
      const { instance } = await shallow.createService();

      expect(instance.isVisible).toBeTrue();

      expect(instance.isIos).toBeFalse();
    });
  });

  describe('when on an iOS device', () => {
    beforeEach(() => {
      shallow = new Shallow(MobileBannerService, CoreModule).mock(
        DeviceService,
        mockIosDeviceService,
      );
    });

    it('should be visible on iOS', async () => {
      const { instance } = await shallow.createService();

      expect(instance.isVisible).toBeTrue();

      expect(instance.isIos).toBeTrue();
    });
  });
});
