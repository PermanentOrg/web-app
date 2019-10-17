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
  private ga: any;

  constructor() {
    this.checkForGlobal();
  }

  private checkForGlobal() {
    if ('ga' in window && typeof ga === 'function' && !this.ga) {
      this.ga = window['ga'];
    }

    console.log('got ga?', window['ga'], this.ga);

    if (!this.ga) {
      return false;
    } else {
      return true;
    }
  }

  sendEvent(eventData: EventData | any) {
    if (this.checkForGlobal()) {
      console.log('finna send', eventData);
      this.ga('send', eventData);
    }
  }

}
