import * as PackageJson from '../../package.json';

const release = PackageJson;

export const environment = {
  production: true,
  apiUrl: 'https://dev.permanent.org/api',
  hmr: false,
  firebase: {
    authDomain: 'prpledgedev.firebaseapp.com',
    databaseURL: 'https://prpledgedev.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgedev.cloudfunctions.net',
    projectId: 'prpledgedev'
  },
  debug: false,
  release: release.version,
  environment: 'dev'
};
