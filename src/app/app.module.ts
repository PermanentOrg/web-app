/* @format */
import { NgModule, Injectable, ErrorHandler, Injector } from '@angular/core';
import {
  RouterModule,
  Router,
  NavigationEnd,
  ActivatedRoute,
  NavigationStart,
} from '@angular/router';
import {
  HttpClientModule,
  HttpClientJsonpModule,
  HttpErrorResponse,
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
import { DialogModule } from './dialog/dialog.module';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { ApiService } from '@shared/services/api/api.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { environment } from '@root/environments/environment';
import { RouteHistoryService } from 'ngx-route-history';
import { InViewportModule } from 'ng-in-viewport';
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faFileArchive, fas } from '@fortawesome/free-solid-svg-icons';

import mixpanel from 'mixpanel-browser';
import { SecretsService } from '@shared/services/secrets/secrets.service';

declare var ga: any;

if (environment.environment !== 'local') {
  Sentry.init({
    dsn: 'https://5cb2f4943c954624913c336eb10da4c5@o360597.ingest.sentry.io/5285675"',
    ignoreErrors: ['ResizeObserver loop limit exceeded'],
    integrations: [
      new Sentry.Integrations.TryCatch({
        XMLHttpRequest: false,
      }),
    ],
    release: `mdot@${environment.release}`,
    environment: environment.environment,
  });
}

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}

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
  imports: [
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    InViewportModule,
    DialogModule.forRoot(),
    FontAwesomeModule,
  ],
  exports: [],
  declarations: [AppComponent, MessageComponent],
  providers: [
    CookieService,
    MessageService,
    {
      provide: ErrorHandler,
      useClass: SentryErrorHandler,
    },
    {
      provide: APP_BASE_HREF,
      useValue: '/',
    },
    RouteHistoryService,
  ],
  bootstrap: [AppComponent],
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
    private secrets: SecretsService
  ) {
    library.addIcons(faFileArchive);
    if (environment.debug) {
      if (!this.storage.local.get('debug')) {
        this.storage.local.set('debug', '*,-sockjs-client:*');
      } else {
        const current = this.storage.local.get('debug');
        if (
          !current.includes('-sockjs-client:') &&
          !current.includes('sockjs-client:')
        ) {
          this.storage.local.set('debug', current + '-sockjs-client:*');
        }
      }
    }

    if (secrets.get('MIXPANEL_TOKEN')) {
      mixpanel.init(secrets.get('MIXPANEL_TOKEN'), {
        debug: environment.analyticsDebug,
        persistence: 'localStorage',
        track_pageview: true,
      });
    }

    // router events for title and GA pageviews
    this.routerListener = this.router.events
      .pipe(
        filter((event) => {
          if (event instanceof NavigationStart) {
            this.routerDebug('start navigate %s', event.url);
          }
          return event instanceof NavigationEnd;
        })
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
        if (!currentTitle) {
          this.title.setTitle(`Permanent.org`);
        } else {
          this.title.setTitle(`${currentTitle} | Permanent.org`);
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
