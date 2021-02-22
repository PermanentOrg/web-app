import { version as release } from '../../package.json';

export const environment = {
  production: true,
  apiUrl: 'https://www.permanent.org/api',
  hmr: false,
  firebase: {
    authDomain: 'prpledgeprod.firebaseapp.com',
    databaseURL: 'https://prpledgeprod.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgeprod.cloudfunctions.net',
    projectId: 'prpledgeprod',
    storageBucket: 'prpledgeprod.appspot.com',
    messagingSenderId: '802935961762'
  },
  debug: false,
  release,
  environment: 'prod'
};
