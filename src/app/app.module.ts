import { NgModule } from '@angular/core';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CookieService } from 'ngx-cookie-service';
import { MessageService } from '@shared/services/message/message.service';

import { AppRoutingModule } from '@root/app/app.routes';

import { AppComponent } from '@root/app/app.component';
import { MessageComponent } from '@shared/components/message/message.component';

@NgModule({
  imports: [
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserModule
  ],
  exports: [
  ],
  declarations: [
    AppComponent,
    MessageComponent
  ],
  providers: [
    CookieService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  private routerListener: Subscription;
  constructor(private title: Title, private router: Router, private route: ActivatedRoute) {
    this.routerListener = this.router.events
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
    });
  }
}
