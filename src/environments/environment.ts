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
    functionsURL: 'https://us-central1-prpledgedev.cloudfunctions.net',
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
