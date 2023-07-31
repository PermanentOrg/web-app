/* @format */
import PackageJson from '../../package.json';

export const environment = {
  production: true,
  apiUrl: 'https://www.permanent.org/api',
  hmr: false,
  firebase: {
    authDomain: 'prpledgeprod.firebaseapp.com',
    databaseURL: 'https://prpledgeprod.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgeprod.cloudfunctions.net',
    projectId: 'prpledgeprod',
  },
  debug: false,
  release: PackageJson.version,
  environment: 'prod',
  analyticsDebug: false,
} as const;
