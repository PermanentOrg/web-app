import PackageJson from '../../package.json';
import { Environment } from './environment-interface';

export const environment: Environment = {
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
	analytics: {
		googleAnalytics: {
			trackingId: 'UA-117528189-1',
		},
		newRelic: {
			agentID: '1833415784',
			applicationID: '1833415784',
			accountID: '3239273',
			trustKey: '3239273',
			licenseKey: 'NRJS-e4d5bb32df7091210db',
		},
	},
} as const;
