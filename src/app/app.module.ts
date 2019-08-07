import { NgModule, Injectable } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import {
  RouterModule,
  Router,
  NavigationEnd,
  ActivatedRoute,
  DefaultUrlSerializer,
  UrlSerializer,
  UrlTree,
  NavigationStart
} from '@angular/router';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';

import { AppRoutingModule } from '@root/app/app.routes';

import { AppComponent } from '@root/app/app.component';
import { MessageComponent } from '@shared/components/message/message.component';
import { DialogModule } from './dialog/dialog.module';

declare var ga: any;

@Injectable()
export class CustomUrlSerializer implements UrlSerializer {
  private defaultSerializer: DefaultUrlSerializer = new DefaultUrlSerializer();

  // custom URL parser to make sure base64 encoded tokens don't screw things up
  parse(url: string): UrlTree {
    if (url.indexOf('/auth/verify/') > -1 ) {
      url = url.replace(/^\/auth\/verify\/([@a-zA-Z0-9+/=]+)\/[a-zA-Z0-9]{4}$/, (fullUrl, b64) => {
        return fullUrl.replace(b64, encodeURIComponent(b64));
      });
    }

    return this.defaultSerializer.parse(url);
  }

  /** Converts a {@link UrlTree} into a url */
  serialize(tree: UrlTree): string {
    return this.defaultSerializer.serialize(tree);
  }
}

export function getBaseLocation() {
  if (location.pathname.indexOf('/p/') === 0) {
    return '/';
  } else {
    return '/m/';
  }
}


@NgModule({
  imports: [
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    DialogModule.forRoot()
  ],
  exports: [
  ],
  declarations: [
    AppComponent,
    MessageComponent,
  ],
  providers: [
    CookieService,
    MessageService,
    {
      provide: UrlSerializer,
      useClass: CustomUrlSerializer
    },
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseLocation
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  private routerListener: Subscription;
  constructor(
    private title: Title,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.routerListener = this.router.events
    .pipe(tap((event) => {
      if (event instanceof NavigationStart) {
        const inSlashP = /^\/p\//.test(window.location.pathname);
        if (event.url.includes('/p/') && !inSlashP) {
          // redirect to plain /p/ and lose the /m/
          window.location.pathname = event.url.replace('/m/', '');
        } else if (!event.url.includes('/p/') && inSlashP) {
          // redirect to /m/
          window.location.pathname = '/m' + event.url;
        }
      }
    }))
    .pipe(filter((event) => {
      return event instanceof NavigationEnd;
    })).subscribe((event) => {
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

