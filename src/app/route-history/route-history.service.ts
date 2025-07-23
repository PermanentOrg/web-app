/* @format */
import { Injectable, OnDestroy } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class RouteHistoryService implements OnDestroy {
	public currentRoute: string;
	public previousRoute: string;

	private subscription: Subscription;
	private popstate: boolean = false;

	constructor(router: Router) {
		this.subscription = router.events.subscribe((event: Event) => {
			if (event instanceof NavigationStart) {
				if (event.navigationTrigger === 'popstate') {
					this.popstate = true;
				}
			}
			if (event instanceof NavigationEnd) {
				this.previousRoute = this.popstate ? undefined : this.currentRoute;
				this.currentRoute = event.url;
				this.popstate = false;
			}
		});
	}

	public ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
