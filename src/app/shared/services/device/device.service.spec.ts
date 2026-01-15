import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { CookieService } from 'ngx-cookie-service';

import { DeviceService } from './device.service';

describe('DeviceService', () => {
	let cookieServiceMock: jasmine.SpyObj<CookieService>;

	beforeEach(async () => {
		cookieServiceMock = jasmine.createSpyObj('CookieService', ['check']);
		cookieServiceMock.check.and.returnValue(false);

		await MockBuilder(DeviceService).provide({
			provide: CookieService,
			useValue: cookieServiceMock,
		});
	});

	it('should be created', () => {
		const instance = TestBed.inject(DeviceService);

		expect(instance).toBeTruthy();
	});

	it('should detect mobile width correctly', () => {
		spyOn(window, 'matchMedia').and.callFake(
			(query: string) =>
				({
					matches: query !== '(min-width: 900px)',
				}) as MediaQueryList,
		);

		const instance = TestBed.inject(DeviceService);

		expect(instance.isMobileWidth()).toBeTrue();
	});

	it('should detect mobile device correctly', () => {
		Object.defineProperty(window.navigator, 'userAgent', {
			value: 'iphone',
			configurable: true,
		});

		const instance = TestBed.inject(DeviceService);

		expect(instance.isMobile()).toBeTrue();
	});

	it('should detect iOS device correctly', () => {
		Object.defineProperty(window.navigator, 'userAgent', {
			value: 'ipad',
			configurable: true,
		});

		const instance = TestBed.inject(DeviceService);

		expect(instance.isIos()).toBeTrue();
	});

	it('should handle cookie check for opt-out correctly', () => {
		cookieServiceMock.check.and.returnValue(true);

		const instance = TestBed.inject(DeviceService);

		expect(instance.didOptOut()).toBeTrue();
	});
});
