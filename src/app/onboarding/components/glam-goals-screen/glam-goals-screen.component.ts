/* @format */
import { Component, EventEmitter, Output } from '@angular/core';
import { goals } from '../../shared/onboarding-screen';

@Component({
  selector: 'pr-glam-goals-screen',
  templateUrl: './glam-goals-screen.component.html',
  styleUrl: './glam-goals-screen.component.scss',
})
export class GlamGoalsScreenComponent {
  public goals = [];
  public selectedGoals: string[] = [];

  @Output() backToNameArchiveOutput = new EventEmitter<string>();
  @Output() goToNextReasonsOutput = new EventEmitter<{
    screen: string;
    goals: string[];
  }>();

  constructor() {
    this.goals = goals;
  }

  backToNameArchive() {
    this.backToNameArchiveOutput.emit('name-archive');
  }

  goToNextReasons() {
    this.goToNextReasonsOutput.emit({
      screen: 'reasons',
      goals: this.selectedGoals,
    });
  }

  public addGoal(goal: string): void {
    if (this.selectedGoals.includes(goal)) {
      this.selectedGoals = this.selectedGoals.filter((g) => g !== goal);
    } else {
      this.selectedGoals.push(goal);
    }
  }
}
