// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { version as release } from '../../package.json';

export const environment = {
  production: false,
  apiKey: '`2QOGhZvC.1.VdaoPn;-gIhi',
  apiUrl: 'https://local.permanent.org/api',
  stripeKey: 'pk_test_kGSsLxH88lyxBUp9Lluji2Rn',
  hmr: false,
  firebase: {
    apiKey: 'AIzaSyAThS43euMcSjPdDvtB9qM-9-diloP-eHE',
    authDomain: 'prpledgedev.firebaseapp.com',
    databaseURL: 'https://prpledgedev.firebaseio.com',
    projectId: 'prpledgedev',
    storageBucket: 'prpledgedev.appspot.com',
    messagingSenderId: '248842011228'
  },
  google: {
    apiKey: 'AIzaSyC6JvFpTpreKFl_1HvWk9pSERh9xbLdTlg'
  },
  debug: false,
  release,
  environment: 'local'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
