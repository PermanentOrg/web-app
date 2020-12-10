import { version as release } from '../../package.json';

export const environment = {
  production: false,
  apiKey: 'wlK?anNl,BW%W#5;FJN11qGn',
  apiUrl: 'https://ng.permanent.org:4200/api',
  uploaderUrl: 'wss://ng.permanent.org:4200/uploadsvc',
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
    apiKey: 'AIzaSyBPlEoumk_gQ0aNCOeaEU61ZKNU94TfCjk'
  },
  debug: true,
  release,
  environment: 'local'
};
