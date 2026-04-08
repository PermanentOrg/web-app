import { vi, expect } from 'vitest';
import { ngMocks } from 'ng-mocks';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
	NgbDatepickerModule,
	NgbDropdownModule,
	NgbPaginationModule,
	NgbTimepickerModule,
	NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CountUpDirective, CountUpModule } from 'ngx-countup';

// Mock external APIs on window
window.Stripe = () => ({
	elements: () => ({
		create: (card: any, options: any) => {},
	}),
	createToken: async (element: any, options: any) => ({
		token: {
			id: '0',
			address_zip: '12345',
		},
		error: false,
	}),
});

// Disable loading of external Google Maps API
window.doNotLoadGoogleMapsAPI = true;

// Configure ng-mocks auto spy for Vitest
ngMocks.autoSpy((name: string) => vi.fn());

// Always Replace RouterModule with RouterTestingModule to avoid errors.
ngMocks.globalReplace(RouterModule, RouterTestingModule);

// Never mock these modules/directives (keep them real)
ngMocks.globalKeep(NgbDatepickerModule);
ngMocks.globalKeep(NgbTimepickerModule);
ngMocks.globalKeep(NgbTooltipModule);
ngMocks.globalKeep(NgbDropdownModule);
ngMocks.globalKeep(NgbPaginationModule);
ngMocks.globalKeep(CountUpDirective);
ngMocks.globalKeep(CountUpModule);

// Custom matchers for ng-mocks compatibility (Vitest version)
expect.extend({
	toHaveFoundOne(received: unknown) {
		let count: number;
		if (Array.isArray(received)) {
			count = received.length;
		} else if (received && typeof received === 'object' && 'length' in received) {
			count = (received as { length: number }).length;
		} else {
			count = received ? 1 : 0;
		}
		const pass = count === 1;
		return {
			pass,
			message: () =>
				pass
					? `Expected not to find exactly one element, but found ${count}`
					: `Expected to find exactly one element, but found ${count}`,
		};
	},
	toHaveFound(received: unknown, expected: number) {
		let count: number;
		if (Array.isArray(received)) {
			count = received.length;
		} else if (received && typeof received === 'object' && 'length' in received) {
			count = (received as { length: number }).length;
		} else {
			count = received ? 1 : 0;
		}
		const pass = count === expected;
		return {
			pass,
			message: () =>
				pass
					? `Expected not to find ${expected} elements, but found ${count}`
					: `Expected to find ${expected} elements, but found ${count}`,
		};
	},
});
