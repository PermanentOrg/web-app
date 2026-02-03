import {
	NgModule,
	Injectable,
	ErrorHandler,
	Injector,
	inject,
	provideAppInitializer,
} from '@angular/core';
import {
	RouterModule,
	Router,
	NavigationEnd,
	ActivatedRoute,
	NavigationStart,
} from '@angular/router';
import {
	HttpErrorResponse,
	provideHttpClient,
	withInterceptorsFromDi,
	withJsonpSupport,
} from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import debug from 'debug';

import * as Sentry from '@sentry/browser';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';

import { AppRoutingModule } from '@root/app/app.routes';

import { AppComponent } from '@root/app/app.component';
import { MessageComponent } from '@shared/components/message/message.component';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { ApiService } from '@shared/services/api/api.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { environment } from '@root/environments/environment';
import { InViewportModule } from 'ng-in-viewport';
import {
	FontAwesomeModule,
	FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faFileArchive } from '@fortawesome/free-solid-svg-icons';

import { AnalyticsService } from '@shared/services/analytics/analytics.service';
import { FormsModule } from '@angular/forms';
import { EventService } from '@shared/services/event/event.service';
import { DataService } from '@shared/services/data/data.service';
import { OverlayContainer, OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { DEFAULT_DIALOG_CONFIG, DialogConfig } from '@angular/cdk/dialog';
import { RouteHistoryModule } from './route-history/route-history.module';
import { CustomOverlayContainer } from './dialog-cdk/custom-overlay-container';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';

declare let ga: any;

export function initializeAnalytics(
	event: EventService,
	analytics: AnalyticsService,
): () => void {
	return () => {
		event.addObserver(analytics);
	};
}

if (environment.environment !== 'local') {
	Sentry.init({
		dsn: 'https://5cb2f4943c954624913c336eb10da4c5@o360597.ingest.sentry.io/5285675"',
		ignoreErrors: ['ResizeObserver loop limit exceeded'],
		integrations: [
			Sentry.browserApiErrorsIntegration({
				XMLHttpRequest: false,
			}),
		],
		release: `mdot@${environment.release}`,
		environment: environment.environment,
	});
}

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
	extractError(error) {
		// Try to unwrap zone.js error.
		// https://github.com/angular/angular/blob/master/packages/core/src/util/errors.ts
		if (error && error.ngOriginalError) {
			error = error.ngOriginalError;
		}

		// We can handle messages and Error objects directly.
		if (typeof error === 'string' || error instanceof Error) {
			return error;
		}

		// If it's http module error, extract as much information from it as we can.
		if (error instanceof HttpErrorResponse) {
			// The `error` property of http exception can be either an `Error` object, which we can use directly...
			if (error.error instanceof Error) {
				return error.error;
			}

			// ... or an`ErrorEvent`, which can provide us with the message but no stack...
			if (error.error instanceof ErrorEvent) {
				return error.error.message;
			}

			// ...or the request body itself, which we can use as a message instead.
			if (typeof error.error === 'string') {
				return `Server returned code ${error.status} with body "${error.error}"`;
			}

			// If we don't have any detailed information, fallback to the request message itself.
			return error.message;
		}

		// Skip if there's no error, and let user decide what to do with it.
		return null;
	}

	handleError(error) {
		const extractedError = this.extractError(error) || 'Handled unknown error';

		// Capture handled exception and send it to Sentry.
		Sentry.captureException(extractedError);

		// When in development mode, log the error to console for immediate feedback.
		if (!environment.production) {
			console.error(extractedError);
		}
	}
}

@Injectable()
export class PermErrorHandler implements ErrorHandler {
	constructor(private injector: Injector) {}
	handleError(error: any) {
		console.error(error);

		const api: ApiService = this.injector.get(ApiService);
		if (api) {
			api.system.logError(error);
		}
	}
}

@NgModule({
	exports: [],
	declarations: [AppComponent, MessageComponent],
	bootstrap: [AppComponent],
	imports: [
		AppRoutingModule,
		RouterModule,
		BrowserModule,
		CommonModule,
		BrowserAnimationsModule,
		InViewportModule,
		FontAwesomeModule,
		FormsModule,
		RouteHistoryModule,
		FeatureFlagModule,
	],
	providers: [
		CookieService,
		MessageService,
		DataService,
		{
			provide: OverlayContainer,
			useClass: CustomOverlayContainer,
		},
		{
			provide: DEFAULT_DIALOG_CONFIG,
			useValue: {
				usePopover: false,
				hasBackdrop: true,
			} as DialogConfig,
		},
		{
			provide: OVERLAY_DEFAULT_CONFIG,
			useValue: {
				usePopover: false,
			},
		},
		provideAppInitializer(() => {
			const initializerFn = initializeAnalytics(
				inject(EventService),
				inject(AnalyticsService),
			);
			return initializerFn();
		}),
		{
			provide: ErrorHandler,
			useClass: SentryErrorHandler,
		},
		{
			provide: APP_BASE_HREF,
			useValue: '/',
		},
		provideHttpClient(withInterceptorsFromDi(), withJsonpSupport()),
	],
})
export class AppModule {
	private routerListener: Subscription;
	private routerDebug = debug('router:navigation');
	constructor(
		private title: Title,
		private router: Router,
		private route: ActivatedRoute,
		private storage: StorageService,
		private library: FaIconLibrary,
	) {
		library.addIcons(faFileArchive);
		if (environment.debug) {
			if (this.storage.local.get('debug')) {
				const current = this.storage.local.get('debug');
				if (
					!current.includes('-sockjs-client:') &&
					!current.includes('sockjs-client:')
				) {
					this.storage.local.set('debug', current + '-sockjs-client:*');
				}
			} else {
				this.storage.local.set('debug', '*,-sockjs-client:*');
			}
		}

		// router events for title and GA pageviews
		this.routerListener = this.router.events
			.pipe(
				filter((event) => {
					if (event instanceof NavigationStart) {
						this.routerDebug('start navigate %s', event.url);
					}
					return event instanceof NavigationEnd;
				}),
			)
			.subscribe((event) => {
				this.routerDebug('end navigate %s', this.router.url);
				let currentRoute = this.route;
				let currentTitle;
				while (currentRoute.firstChild) {
					currentRoute = currentRoute.firstChild;
					if (currentRoute.snapshot.data.title) {
						currentTitle = currentRoute.snapshot.data.title;
					}
				}
				if (currentTitle) {
					this.title.setTitle(`${currentTitle} | Permanent.org`);
				} else {
					this.title.setTitle(`Permanent.org`);
				}

				let skipGaPageview = false;

				const gaRouteBlacklist = ['/embed', '/pledge'];

				for (const blacklistRoute of gaRouteBlacklist) {
					skipGaPageview = this.router.url.includes(blacklistRoute);
					if (skipGaPageview) {
						break;
					}
				}

				if ('ga' in window && ga.getAll && !skipGaPageview) {
					const tracker = ga.getAll()[0];
					if (tracker) {
						tracker.send('pageview', { page: location.pathname });
					}
				}
			});
	}
}
