import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

let gradientCount = 0;

const takeGradientId = (): string => {
	gradientCount += 1;
	return `pr-icon-text-input-gradient-${gradientCount}`;
};

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
	@Input() invalid = false;

	@Output() valueChange = new EventEmitter<string>();

	readonly gradientId = takeGradientId();
	readonly iconFill = `url('#${this.gradientId}')`;

	onInput(event: Event): void {
		this.valueChange.emit((event.target as HTMLInputElement).value);
	}

	clear(): void {
		this.valueChange.emit('');
	}
}
