import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * The id of the gradient these icons are painted with. An SVG `fill` can only
 * reference a definition by id, so whoever hosts these inputs renders it once
 * under this id; without it the icon falls back to a flat colour.
 */
export const ICON_GRADIENT_ID = 'pr-icon-gradient';

@Component({
	selector: 'pr-icon-text-input',
	standalone: true,
	imports: [CommonModule, FontAwesomeModule],
	templateUrl: './icon-text-input.component.html',
	styleUrls: ['./icon-text-input.component.scss'],
})
export class IconTextInputComponent {
	/** Font Awesome icon rendered in the leading tile. */
	@Input() icon: IconProp;

	/**
	 * Names the field for both sighted users (as the placeholder) and assistive
	 * technology (as the accessible name); a placeholder alone is not a label.
	 */
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
