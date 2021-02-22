import { version as release } from '../../package.json';

export const environment = {
  production: false,
  apiUrl: 'https://local.permanent.org/api',
  hmr: false,
  firebase: {
    authDomain: 'prpledgedev.firebaseapp.com',
    databaseURL: 'https://prpledgedev.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgedev.cloudfunctions.net',
    projectId: 'prpledgedev'
  },
  debug: false,
  release,
  environment: 'local'
};
