import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

/** The host renders the gradient definition; an SVG fill can only cite an id. */
export const ICON_GRADIENT_ID = 'pr-icon-gradient';

@Component({
	selector: 'pr-icon-text-input',
	standalone: true,
	imports: [CommonModule, FontAwesomeModule],
	templateUrl: './icon-text-input.component.html',
	styleUrls: ['./icon-text-input.component.scss'],
})
export class IconTextInputComponent {
	@Input() icon: IconProp;

	/** Placeholder and accessible name; a placeholder alone is not a label. */
	@Input() label = '';

	@Input() value = '';
	@Input() disabled = false;

	@Output() valueChange = new EventEmitter<string>();

	onInput(event: Event): void {
		this.valueChange.emit((event.target as HTMLInputElement).value);
	}

	clear(): void {
		this.valueChange.emit('');
	}
}
