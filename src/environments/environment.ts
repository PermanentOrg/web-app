import * as PackageJson from '../../package.json';

const release = PackageJson;

export const environment = {
  production: false,
  apiUrl: 'https://ng.permanent.org:4200/api',
  hmr: false,
  firebase: {
    authDomain: 'prpledgedev.firebaseapp.com',
    databaseURL: 'https://prpledgedev.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgedev.cloudfunctions.net',
    projectId: 'prpledgedev'
  },
  debug: true,
  release: release.version,
  environment: 'local'
};
