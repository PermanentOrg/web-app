/* @format */
import { Injectable } from '@angular/core';
import { MixpanelData, AnalyticsService } from '../analytics/analytics.service';

export type EventData = MixpanelData;

export interface EventObserver {
  update(eventData: EventData): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private observers: EventObserver[] = [];

  constructor() {}

  public addObserver(observer: EventObserver): void {
    this.observers.push(observer);
  }

  public notifyObservers(eventData: EventData): void {
    this.observers.forEach((observer) => {
      observer.update(eventData);
    });
  }

  public removeObserver(observer: EventObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
}
