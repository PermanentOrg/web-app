import { version as release } from '../../package.json';

export const environment = {
  production: false,
  apiKey: '`2QOGhZvC.1.VdaoPn;-gIhi',
  apiUrl: 'https://ng.permanent.org:4200/api',
  uploaderUrl: 'wss://local.permanent.org:9000/uploadsvc',
  hmr: false,
  stripeKey: 'pk_test_kGSsLxH88lyxBUp9Lluji2Rn',
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
  debug: true,
  release,
  environment: 'local'
};
