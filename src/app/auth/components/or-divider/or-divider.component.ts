import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'pr-or-divider',
	standalone: false,
	templateUrl: './or-divider.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrl: './or-divider.component.scss',
})
export class OrDividerComponent {
	@Input() public text: string = '';
}
