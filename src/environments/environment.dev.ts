import PackageJson from '../../package.json';
import { Environment } from './environment-interface';

export const environment: Environment = {
	production: true,
	apiUrl: 'https://app.dev.permanent.org/api',
	hmr: false,
	firebase: {
		authDomain: 'prpledgedev.firebaseapp.com',
		databaseURL: 'https://prpledgedev.firebaseio.com',
		functionsURL: 'https://us-central1-prpledgedev.cloudfunctions.net',
		projectId: 'prpledgedev',
	},
	debug: false,
	release: PackageJson.version,
	environment: 'dev',
	analyticsDebug: true,
} as const;
