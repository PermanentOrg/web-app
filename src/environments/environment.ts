import { version as release } from '../../package.json';

export const environment = {
  production: false,
  apiKey: '`2QOGhZvC.1.VdaoPn;-gIhi',
  apiUrl: 'https://local.permanent.org/api',
  hmr: false,
  firebase: {
    authDomain: 'prpledgedev.firebaseapp.com',
    databaseURL: 'https://prpledgedev.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgedev.cloudfunctions.net',
    projectId: 'prpledgedev',
    storageBucket: 'prpledgedev.appspot.com',
    messagingSenderId: '248842011228'
  },
  debug: false,
  release,
  environment: 'local'
};
