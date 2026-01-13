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
	analytics: {
		googleAnalytics: {
			trackingId: 'UA-117528189-2',
		},
		newRelic: {
			agentID: '1833415775',
			applicationID: '1833415775',
			accountID: '3239273',
			trustKey: '3239273',
			licenseKey: 'NRJS-e4d5bb32df7091210db',
		},
	},
} as const;
