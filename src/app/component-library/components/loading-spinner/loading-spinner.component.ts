import {
	Component,
	HostBinding,
	Input,
	ChangeDetectionStrategy,
} from '@angular/core';

@Component({
	selector: 'pr-loading-spinner',
	templateUrl: './loading-spinner.component.html',
	styleUrl: './loading-spinner.component.scss',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class LoadingSpinnerComponent {
	@Input() isFullScreen = false;

	@HostBinding('class.full-screen') get fullScreenClass() {
		return this.isFullScreen;
	}
}
