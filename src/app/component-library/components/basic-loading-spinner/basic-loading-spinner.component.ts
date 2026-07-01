import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'pr-basic-loading-spinner',
	templateUrl: './basic-loading-spinner.component.html',
	styleUrl: './basic-loading-spinner.component.scss',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class BasicLoadingSpinnerComponent {}
