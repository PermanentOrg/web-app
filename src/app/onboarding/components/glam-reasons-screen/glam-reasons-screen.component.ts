/* @format */
import { Component, Output, EventEmitter } from '@angular/core';
import { reasons } from '../../shared/onboarding-screen';

@Component({
  selector: 'pr-glam-reasons-screen',
  templateUrl: './glam-reasons-screen.component.html',
  styleUrl: './glam-reasons-screen.component.scss',
})
export class GlamReasonsScreenComponent {
  public reasons = [];
  public selectedReasons = [];
  @Output() backToGoalsOutput = new EventEmitter<string>();
  @Output() finalizeArchiveOutput = new EventEmitter<{
    screen: string;
    reasons: string[];
  }>();

  constructor() {
    this.reasons = reasons;
  }

  backToGoals() {
    this.backToGoalsOutput.emit('goals');
  }

  finalizeArchive() {
    this.finalizeArchiveOutput.emit({
      screen: 'finalize',
      reasons: this.selectedReasons,
    });
  }

  public addReason(reason: string): void {
    if (this.selectedReasons.includes(reason)) {
      this.selectedReasons = this.selectedReasons.filter((r) => r !== reason);
    } else {
      this.selectedReasons.push(reason);
    }
  }
}
