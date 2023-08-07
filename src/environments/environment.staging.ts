/* @format */
import PackageJson from '../../package.json';
import { Environment } from './environment-interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://staging.permanent.org/api',
  hmr: false,
  firebase: {
    authDomain: 'prpledgestaging.firebaseapp.com',
    databaseURL: 'https://prpledgestaging.firebaseio.com',
    functionsURL: 'https://us-central1-prpledgestaging.cloudfunctions.net',
    projectId: 'prpledgestaging',
  },
  debug: false,
  release: PackageJson.version,
  environment: 'staging',
  analyticsDebug: true,
} as const;
