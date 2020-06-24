import { version as release } from '../../package.json';

export const environment = {
  production: true,
  apiKey: 'wlK?anNl,BW%W#5;FJN11qGn',
  apiUrl: 'https://test.permanent.org/api',
  stripeKey: 'pk_test_kGSsLxH88lyxBUp9Lluji2Rn',
  hmr: false,
  firebase: {
    apiKey: 'AIzaSyBElcQliVYu6_gVqtN2voNcu0mVY0Z7p58',
    authDomain: 'prpledgestaging.firebaseapp.com',
    databaseURL: 'https://prpledgestaging.firebaseio.com',
    projectId: 'prpledgestaging',
    storageBucket: 'prpledgestaging.appspot.com',
    messagingSenderId: '311870668048'
  },
  google: {
    apiKey: 'AIzaSyC6JvFpTpreKFl_1HvWk9pSERh9xbLdTlg'
  },
  release,
  environment: 'testots'
};
