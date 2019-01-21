// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiKey: '`2QOGhZvC.1.VdaoPn;-gIhi',
  apiUrl: 'https://local.permanent.org:4200/api',
  uploaderUrl: 'wss://local.permanent.org:4200/uploadsvc',
  hmr: true,
  firebase: {
    apiKey: 'AIzaSyD-J4OOPSluilh9GSvslWtlJsFIoWXES44',
    authDomain: 'prpledgetest.firebaseapp.com',
    databaseURL: 'https://prpledgetest.firebaseio.com',
    projectId: 'prpledgetest',
    storageBucket: 'prpledgetest.appspot.com',
    messagingSenderId: '4115520516'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
