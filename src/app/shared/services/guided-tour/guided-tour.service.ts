import { Injectable } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import { Subject } from 'rxjs';
import { GuidedTourEvent } from './events';

import type { ShepherdStep } from './step';


@Injectable({
  providedIn: 'root'
})
export class GuidedTourService {
  private eventsSubject = new Subject<GuidedTourEvent>();

  constructor(
    private shepherd: ShepherdService
  ) {
    this.shepherd.modal = true;
  }

  startTour(steps: ShepherdStep[]) {
    this.shepherd.addSteps(steps);
    setTimeout(() => {
      this.shepherd.start();
    });

    return this.shepherd.tourObject;
  }

  emit(event: GuidedTourEvent, data?: any) {
    this.eventsSubject.next(event);
  }

  next() {
    this.shepherd.next();
  }

  events$() {
    return this.eventsSubject.asObservable();
  }
}
