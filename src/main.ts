import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAgent } from '@newrelic/browser-agent/loaders/browser-agent';
import { addIcons } from 'ionicons';
import {
	addCircle,
	caretBack,
	caretForward,
	exit,
	folder,
	helpCircle,
	informationCircle,
	people,
	personAdd,
	search,
} from 'ionicons/icons';
import { defineCustomElements } from 'ionicons/loader';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Initialize Ionicons web components
addIcons({
	addCircle,
	caretBack,
	caretForward,
	exit,
	folder,
	helpCircle,
	informationCircle,
	people,
	personAdd,
	search,
});
defineCustomElements(window);

// Initialize New Relic browser agent
const newRelicConfig = environment.analytics.newRelic;
export const newRelicAgent = new BrowserAgent({
	init: {
		distributed_tracing: { enabled: true },
		privacy: { cookies_enabled: true },
		ajax: { deny_list: ['bam.nr-data.net'] },
	},
	info: {
		beacon: 'bam.nr-data.net',
		errorBeacon: 'bam.nr-data.net',
		licenseKey: newRelicConfig.licenseKey,
		applicationID: newRelicConfig.applicationID,
		sa: 1,
	},
	loader_config: {
		accountID: newRelicConfig.accountID,
		trustKey: newRelicConfig.trustKey,
		agentID: newRelicConfig.agentID,
		licenseKey: newRelicConfig.licenseKey,
		applicationID: newRelicConfig.applicationID,
	},
});

// Initialize Google Analytics
declare global {
	interface Window {
		ga: ((...args: unknown[]) => void) & { q?: unknown[]; l?: number };
		GoogleAnalyticsObject: string;
	}
}

(function initGoogleAnalytics() {
	window.GoogleAnalyticsObject = 'ga';
	window.ga =
		window.ga ||
		function (...args: unknown[]) {
			(window.ga.q = window.ga.q || []).push(args);
		};
	window.ga.l = Date.now();

	const script = document.createElement('script');
	script.async = true;
	script.src = 'https://www.google-analytics.com/analytics.js';
	const firstScript = document.getElementsByTagName('script')[0];
	firstScript?.parentNode?.insertBefore(script, firstScript);
})();

window.ga('create', environment.analytics.googleAnalytics.trackingId, 'auto');
window.ga('set', 'anonymizeIp', true);
window.ga('send', 'pageview');

if (environment.production) {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
