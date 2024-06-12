import { Component, Output, EventEmitter } from '@angular/core';
import { reasons } from '../../shared/onboarding-screen';

@Component({
  selector: 'pr-glam-reasons-screen',
  templateUrl: './glam-reasons-screen.component.html',
  styleUrl: './glam-reasons-screen.component.scss'
})
export class GlamReasonsScreenComponent {

  public reasons = [];
  @Output() backToGoalsOutput = new EventEmitter<string>();
  @Output() finalizeArchiveOutput = new EventEmitter<string>();

  constructor() {
    this.reasons = reasons;
  }

  backToGoals() {
    this.backToGoalsOutput.emit('goals');
  }

  finalizeArchive() {
    this.finalizeArchiveOutput.emit('...');
  }

}
