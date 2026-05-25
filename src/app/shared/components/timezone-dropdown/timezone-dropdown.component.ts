import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	computed,
	ElementRef,
	ViewChild,
	HostListener,
	inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	TimezoneOption,
	TimezoneService,
} from '@shared/services/timezone-service/timezone.service';

@Component({
	selector: 'pr-timezone-dropdown',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './timezone-dropdown.component.html',
	styleUrls: ['./timezone-dropdown.component.scss'],
})
export class TimezoneDropdownComponent {
	private readonly timezoneService = inject(TimezoneService);

	@Input() selectedOffsetFallback = '';
	@Input() disabled = false;

	get selectedZone(): string {
		return this._selectedZone();
	}

	@Input()
	set selectedZone(value: string | null | undefined) {
		this._selectedZone.set(value ?? '');
	}

	get referenceDate(): Date {
		return this._referenceDate();
	}

	@Input()
	set referenceDate(value: Date | null | undefined) {
		this._referenceDate.set(value ?? new Date());
	}

	@Output() timezoneChange = new EventEmitter<TimezoneOption>();

	@ViewChild('dropdownContainer') dropdownContainer?: ElementRef<HTMLElement>;

	isOpen = signal(false);
	filter = signal('');

	private readonly _selectedZone = signal<string>('');
	private readonly _referenceDate = signal<Date>(new Date());

	zones = computed<TimezoneOption[]>(() =>
		this.timezoneService.getZones(this._referenceDate()),
	);

	selectedOption = computed<TimezoneOption | null>(() => {
		const zone = this._selectedZone();
		if (!zone) return null;
		const referenceDate = this._referenceDate();
		return {
			ianaZone: zone,
			offset: this.timezoneService.computeOffsetForZone(zone, referenceDate),
			label: this.timezoneService.formatZoneLabel(zone),
			abbreviation: this.timezoneService.getAbbreviationForZone(
				zone,
				referenceDate,
			),
		};
	});

	filteredTimezones = computed(() => {
		const term = this.filter().toLowerCase();
		const allZones = this.zones();
		if (!term) return allZones;
		return allZones.filter(
			(tz) =>
				tz.ianaZone.toLowerCase().includes(term) ||
				tz.label.toLowerCase().includes(term) ||
				tz.offset.toLowerCase().includes(term) ||
				tz.abbreviation.toLowerCase().includes(term),
		);
	});

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		const target = event.target as Node;
		if (!this.dropdownContainer?.nativeElement.contains(target)) {
			this.close();
		}
	}

	toggle(): void {
		if (this.disabled) return;
		if (this.isOpen()) {
			this.close();
		} else {
			this.isOpen.set(true);
			this.filter.set('');
		}
	}

	close(): void {
		this.isOpen.set(false);
		this.filter.set('');
	}

	select(tz: TimezoneOption): void {
		this.timezoneChange.emit(tz);
		this.close();
	}

	clearSelection(): void {
		this.timezoneChange.emit({
			ianaZone: '',
			offset: '',
			label: '',
			abbreviation: '',
		});
		this.close();
	}
}
