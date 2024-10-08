import { Injectable } from '@angular/core';

declare var ga: any;

export interface EventParams {
  hitType: 'event' | string;
  eventCategory: string;
  eventAction: string;
}

export interface GaEventData {
  key: string;
  params: EventParams;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  private tracker: any;

  constructor() {
    this.checkForGlobal();
  }

  private checkForGlobal() {
    if ('ga' in window && ga.getAll && !this.tracker) {
      this.tracker = ga.getAll()[0];
    }

    if (!this.tracker) {
      return false;
    } else {
      return true;
    }
  }

  sendEvent(eventData: EventParams) {
    if (this.checkForGlobal()) {
      this.tracker.send(eventData);
    }
  }
}
