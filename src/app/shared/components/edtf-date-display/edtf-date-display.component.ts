import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
} from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ngIfFadeInAnimation } from '@shared/animations';
import { EdtfDisplayService } from '@shared/services/edtf-service/edtf-display.service';

@Component({
	selector: 'pr-edtf-date-display',
	standalone: true,
	imports: [NgbTooltipModule],
	templateUrl: './edtf-date-display.component.html',
	styleUrls: ['./edtf-date-display.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [ngIfFadeInAnimation],
})
export class EdtfDateDisplayComponent {
	readonly displayTime = input<string | null | undefined>();
	readonly showTime = input(true);

	private readonly edtfDisplayService = inject(EdtfDisplayService);

	private readonly displayText = computed(() =>
		this.edtfDisplayService.formatForDisplay(this.displayTime()),
	);

	readonly dateSegments = computed(() => this.displayText().date);
	readonly dateEndSegments = computed(() => this.displayText().dateEnd);
	readonly timeSegments = computed(() => this.displayText().time);
	readonly hasTime = computed(
		() => this.showTime() && this.timeSegments().length > 0,
	);
	readonly tooltip = computed(() =>
		this.edtfDisplayService.formatForTooltip(this.displayTime()),
	);
}
