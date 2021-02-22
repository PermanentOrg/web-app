import { version as release } from '../../package.json';

export const environment = {
  production: true,
  apiUrl: 'https://staging.permanent.org/api',
  hmr: false,
  firebase: {
    authDomain: 'prpledgestaging.firebaseapp.com',
    databaseURL: 'https://prpledgestaging.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgestaging.cloudfunctions.net',
    projectId: 'prpledgestaging'
  },
  debug: false,
  release,
  environment: 'staging'
};
