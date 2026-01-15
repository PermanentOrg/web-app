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
	analytics: {
		googleAnalytics: {
			trackingId: 'UA-117528189-2',
		},
		newRelic: {
			agentID: '1833415763',
			applicationID: '1833415763',
			accountID: '3239273',
			trustKey: '3239273',
			licenseKey: 'NRJS-e4d5bb32df7091210db',
		},
	},
} as const;
