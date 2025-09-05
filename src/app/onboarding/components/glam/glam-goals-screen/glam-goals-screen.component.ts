import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { goals } from '../../../shared/onboarding-screen';

interface OutputModel {
	screen: string;
	goals: string[];
}

@Component({
	selector: 'pr-glam-goals-screen',
	templateUrl: './glam-goals-screen.component.html',
	styleUrl: './glam-goals-screen.component.scss',
	standalone: false,
})
export class GlamGoalsScreenComponent implements OnInit {
	public goals = [];
	@Input() selectedGoals: string[] = [];
	@Output() goalsOutput = new EventEmitter<OutputModel>();

	constructor() {
		this.goals = goals;
	}

	ngOnInit(): void {
		const storageGoals = sessionStorage.getItem('goals');
		if (storageGoals) {
			this.selectedGoals = JSON.parse(storageGoals);
		}
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
	public addGoal(goal: string): void {
		if (this.selectedGoals.includes(goal)) {
			this.selectedGoals = this.selectedGoals.filter((g) => g !== goal);
		} else {
			this.selectedGoals.push(goal);
		}
		sessionStorage.setItem('goals', JSON.stringify(this.selectedGoals));
	}

	public skipStep(): void {
		this.selectedGoals = [];
		sessionStorage.setItem('goals', JSON.stringify([]));
		this.goalsOutput.emit({
			screen: 'reasons',
			goals: [],
		});
	}
}
