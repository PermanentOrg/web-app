/* @format */
// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { Shallow } from 'shallow-render';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  NgbDatepickerModule,
  NgbDropdownModule,
  NgbPaginationModule,
  NgbTimepickerModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';

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
      };
    },
  };
};

// Disable loading of external Google Maps API
window['doNotLoadGoogleMapsAPI'] = true;

// Disable loading of MixPanel

// Always Replace RouterModule with RouterTestingModule to avoid errors.
Shallow.alwaysReplaceModule(RouterModule, RouterTestingModule);
Shallow.neverMock(
  NgbDatepickerModule,
  NgbTimepickerModule,
  NgbTooltipModule,
  NgbDropdownModule,
  NgbPaginationModule,
);

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: false },
  },
);
