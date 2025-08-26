import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { reasons } from '../../../shared/onboarding-screen';

interface ReasonsEmit {
	screen: string;
	reasons: string[];
}

@Component({
	selector: 'pr-glam-reasons-screen',
	templateUrl: './glam-reasons-screen.component.html',
	styleUrl: './glam-reasons-screen.component.scss',
	standalone: false,
})
export class GlamReasonsScreenComponent implements OnInit {
	public reasons = [];
	@Input() selectedReasons = [];
	@Output() backToGoalsOutput = new EventEmitter<ReasonsEmit>();
	@Output() reasonsEmit = new EventEmitter<ReasonsEmit>();

	constructor() {
		this.reasons = reasons;
	}

	ngOnInit(): void {
		const storageReasons = sessionStorage.getItem('reasons');
		if (storageReasons) {
			this.selectedReasons = JSON.parse(storageReasons);
		}
	}

	backToGoals() {
		this.reasonsEmit.emit({ screen: 'goals', reasons: this.selectedReasons });
	}

	finalizeArchive() {
		this.reasonsEmit.emit({
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
		sessionStorage.setItem('reasons', JSON.stringify(this.selectedReasons));
	}

	public skipStep(): void {
		this.selectedReasons = [];
		sessionStorage.setItem('reasons', JSON.stringify([]));
		this.reasonsEmit.emit({
			screen: 'finalize',
			reasons: [],
		});
	}
}
