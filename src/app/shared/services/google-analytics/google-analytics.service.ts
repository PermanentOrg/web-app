import { Injectable } from '@angular/core';

declare var ga: any;

interface EventData {
  key: string;
  params: {
    hitType: 'event';
    eventCategory: string;
    eventAction: string;
  };
}

@Injectable({
  providedIn: 'root'
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

  sendEvent(eventData: EventData | any) {
    if (this.checkForGlobal()) {
      this.tracker.send(eventData['params'] ? eventData.params : eventData);
    }
  }

}
