// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;
window['Stripe'] = () => {
  return {
    elements: () => {
      return {
        create: (card, options) => {},
      };
    },
    createToken: async (element, options) => {
      return {
        token: {
          id: '0',
          address_zip: '12345',
        },
        error: false,
      }
    },
  }
};

// Disable loading of external Google Maps API
window['doNotLoadGoogleMapsAPI'] = true;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
