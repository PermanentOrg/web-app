/* @format */
import { Injectable } from '@angular/core';
import { MixpanelData, MixpanelService } from '../mixpanel/mixpanel.service';

export type EventData = MixpanelData;

export interface AnalyticsObserver {
  update(eventData: EventData): void;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private observers: AnalyticsObserver[] = [];

  constructor() {}

  public addObserver(observer: AnalyticsObserver): void {
    this.observers.push(observer);
  }

  public notifyObservers(eventData: EventData): void {
    this.observers.forEach((observer) => {
      observer.update(eventData);
    });
  }

  public removeObserver(observer: AnalyticsObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
}
