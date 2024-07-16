/* @format */
import { SharedModule } from '@shared/shared.module';
import { CookieService } from 'ngx-cookie-service';
import { Shallow } from 'shallow-render';

import { DeviceService } from './device.service';

describe('DeviceService', () => {
  let shallow: Shallow<DeviceService>;
  beforeEach(() => {
    shallow = new Shallow(DeviceService, SharedModule).mock(CookieService, {
      check: () => false,
    });
  });

  it('should be created', async () => {
    const { instance } = await shallow.createService();

    expect(instance).toBeTruthy();
  });

  it('should detect mobile width correctly', async () => {
    spyOn(window, 'matchMedia').and.callFake((query: string) => {
      return {
        matches: query !== '(min-width: 900px)',
      } as MediaQueryList;
    });

    const { instance } = await shallow.createService();

    expect(instance.isMobileWidth()).toBeTrue();
  });

  it('should detect mobile device correctly', async () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'iphone',
      configurable: true,
    });

    const { instance } = await shallow.createService();

    expect(instance.isMobile()).toBeTrue();
  });

  it('should detect iOS device correctly', async () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'ipad',
      configurable: true,
    });

    const { instance } = await shallow.createService();

    expect(instance.isIos()).toBeTrue();
  });

  it('should handle cookie check for opt-out correctly', async () => {
    const cookieService = jasmine.createSpyObj('CookieService', ['check']);
    cookieService.check.and.returnValue(true);

    shallow = shallow.mock(CookieService, cookieService);

    const { instance } = await shallow.createService();

    expect(instance.didOptOut()).toBeTrue();
  });
});
