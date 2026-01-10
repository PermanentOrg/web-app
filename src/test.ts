// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
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
import { installNgMocksMatchers } from './test/ng-mocks-matchers';

window.Stripe = () => ({
	elements: () => ({
		create: (card, options) => {},
	}),
	createToken: async (element, options) => ({
		token: {
			id: '0',
			address_zip: '12345',
		},
		error: false,
	}),
});

// Disable loading of external Google Maps API
window.doNotLoadGoogleMapsAPI = true;

// Disable loading of MixPanel

// Configure ng-mocks auto spy for Jasmine
ngMocks.autoSpy('jasmine');

// Allow respy for Jasmine (needed for some test patterns)
jasmine.getEnv().allowRespy(true);

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

// Install custom Jasmine matchers for ng-mocks compatibility
installNgMocksMatchers();

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting(),
);
