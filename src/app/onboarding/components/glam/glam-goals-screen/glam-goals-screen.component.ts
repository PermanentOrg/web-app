/* @format */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { goals } from '../../../shared/onboarding-screen';

interface OutputModel {
  screen: string;
  goals: string[];
}

@Component({
  selector: 'pr-glam-goals-screen',
  templateUrl: './glam-goals-screen.component.html',
  styleUrl: './glam-goals-screen.component.scss',
})
export class GlamGoalsScreenComponent {
  public goals = [];
  @Input() selectedGoals: string[] = [];
  @Output() goalsOutput = new EventEmitter<OutputModel>();

  constructor() {
    this.goals = goals;
  }

  backToNameArchive() {
    this.goalsOutput.emit({
      screen: 'name-archive',
      goals: this.selectedGoals,
    });
  }

  goToNextReasons() {
    this.goalsOutput.emit({
      screen: 'reasons',
      goals: this.selectedGoals,
    });
  }
  p;
  public addGoal(goal: string): void {
    if (this.selectedGoals.includes(goal)) {
      this.selectedGoals = this.selectedGoals.filter((g) => g !== goal);
    } else {
      this.selectedGoals.push(goal);
    }
  }
}
