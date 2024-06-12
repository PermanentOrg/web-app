import { Component, EventEmitter, Output } from '@angular/core';
import { goals } from '../../shared/onboarding-screen';

@Component({
  selector: 'pr-glam-goals-screen',
  templateUrl: './glam-goals-screen.component.html',
  styleUrl: './glam-goals-screen.component.scss',
})
export class GlamGoalsScreenComponent {
  public goals = [];

  @Output() backToNameArchiveOutput = new EventEmitter<string>();
  @Output() goToNextReasonsOutput = new EventEmitter<string>();

  constructor() {
    this.goals = goals;
  }

  backToNameArchive() {
    this.backToNameArchiveOutput.emit('name-archive');
  }

  goToNextReasons() {
    this.goToNextReasonsOutput.emit('reasons');
  }
}
