import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'pr-dialog-frame',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './dialog-frame.component.html',
	styleUrls: ['./dialog-frame.component.scss'],
})
export class DialogFrameComponent {
	@Input() heading = '';
	@Input() confirmLabel = 'Save';
	@Input() cancelLabel = 'Cancel';
	@Input() confirmDisabled = false;

	@Output() confirmed = new EventEmitter<void>();
	@Output() cancelled = new EventEmitter<void>();
}
