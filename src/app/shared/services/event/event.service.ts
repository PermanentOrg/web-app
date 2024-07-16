/* @format */
import { Injectable } from '@angular/core';
import { PermanentEvent } from './event-types';

export interface EventObserver {
  update(eventData: PermanentEvent): Promise<void>;
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

  public dispatch(eventData: PermanentEvent): void {
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
