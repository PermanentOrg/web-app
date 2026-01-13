interface FirebaseConfig {
	authDomain: string;
	databaseURL: string;
	functionsURL: string;
	projectId: string;
}

interface NewRelicConfig {
	agentID: string;
	applicationID: string;
	accountID: string;
	trustKey: string;
	licenseKey: string;
}

interface AnalyticsConfig {
	googleAnalytics: {
		trackingId: string;
	};
	newRelic: NewRelicConfig;
}

export interface Environment {
	production: boolean;
	apiUrl: string;
	hmr: boolean;
	firebase: FirebaseConfig;
	debug: boolean;
	release: string;
	environment: string;
	analyticsDebug: boolean;
	analytics: AnalyticsConfig;
}
