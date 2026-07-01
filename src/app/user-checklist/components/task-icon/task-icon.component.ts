import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'pr-task-icon',
	templateUrl: './task-icon.component.html',
	styleUrl: './task-icon.component.scss',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class TaskIconComponent {
	@Input() public icon: string = '';
	@Input() public completed: boolean = false;
}
