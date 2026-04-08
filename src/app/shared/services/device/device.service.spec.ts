import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { CookieService } from 'ngx-cookie-service';

import { DeviceService } from './device.service';

import { vi } from 'vitest';

describe('DeviceService', () => {
	let cookieServiceMock: any;

	beforeEach(async () => {
		cookieServiceMock = { check: vi.fn() } as any;
		cookieServiceMock.check.mockReturnValue(false);

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
		vi.spyOn(window, 'matchMedia').mockImplementation(
			(query: string) =>
				({
					matches: query !== '(min-width: 900px)',
				}) as MediaQueryList,
		);

		const instance = TestBed.inject(DeviceService);

		expect(instance.isMobileWidth()).toBe(true);
	});

	it('should detect mobile device correctly', () => {
		Object.defineProperty(window.navigator, 'userAgent', {
			value: 'iphone',
			configurable: true,
		});

		const instance = TestBed.inject(DeviceService);

		expect(instance.isMobile()).toBe(true);
	});

	it('should detect iOS device correctly', () => {
		Object.defineProperty(window.navigator, 'userAgent', {
			value: 'ipad',
			configurable: true,
		});

		const instance = TestBed.inject(DeviceService);

		expect(instance.isIos()).toBe(true);
	});

	it('should handle cookie check for opt-out correctly', () => {
		cookieServiceMock.check.mockReturnValue(true);

		const instance = TestBed.inject(DeviceService);

		expect(instance.didOptOut()).toBe(true);
	});
});
