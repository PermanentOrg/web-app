/* @format */
import { Injectable, OnDestroy } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouteHistoryService implements OnDestroy {
  public currentRoute: string;
  public previousRoute: string;

  private subscription: Subscription;

  constructor(router: Router) {
    this.subscription = router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.previousRoute = this.currentRoute;
        this.currentRoute = event.url;
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
