import { Injectable } from '@angular/core';
import { ShepherdService } from 'angular-shepherd';
import type { ShepherdStep } from './step';

@Injectable({
  providedIn: 'root'
})
export class GuidedTourService {

  constructor(
    private shepherd: ShepherdService
  ) {
  }

  startTour(steps: ShepherdStep[]) {
    this.shepherd.modal = true;
    this.shepherd.addSteps(steps);
    this.shepherd.start();
  }
}
