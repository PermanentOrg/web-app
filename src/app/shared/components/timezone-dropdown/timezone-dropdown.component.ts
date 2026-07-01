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
	ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimezoneOption {
	ianaZone: string;
	label: string;
	offset: string;
	abbreviation: string;
}

function getSupportedIanaZones(): string[] {
	const supportedValuesOf = (
		Intl as unknown as {
			supportedValuesOf?: (key: string) => string[];
		}
	).supportedValuesOf;
	return typeof supportedValuesOf === 'function'
		? supportedValuesOf('timeZone')
		: [];
}

function extractTimeZoneNamePart(
	ianaZone: string,
	timeZoneName: 'longOffset' | 'short',
	referenceDate: Date,
): string {
	try {
		const parts = new Intl.DateTimeFormat('en-US', {
			timeZone: ianaZone,
			timeZoneName,
		}).formatToParts(referenceDate);
		return parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
	} catch {
		return '';
	}
}

function buildTimezoneOptions(): TimezoneOption[] {
	const referenceDate = new Date();
	return getSupportedIanaZones().map((ianaZone) => ({
		ianaZone,
		label: ianaZone.replace(/_/g, ' ').replace(/\//g, ' / '),
		offset: extractTimeZoneNamePart(ianaZone, 'longOffset', referenceDate),
		abbreviation: extractTimeZoneNamePart(ianaZone, 'short', referenceDate),
	}));
}

const TIMEZONE_OPTIONS: TimezoneOption[] = buildTimezoneOptions();

@Component({
	selector: 'pr-timezone-dropdown',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './timezone-dropdown.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./timezone-dropdown.component.scss'],
})
export class TimezoneDropdownComponent {
	@Input() selected: TimezoneOption | null = null;
	@Input() disabled = false;
	@Output() timezoneChange = new EventEmitter<TimezoneOption | null>();

	@ViewChild('dropdownContainer') dropdownContainer?: ElementRef<HTMLElement>;

	isOpen = signal(false);
	filter = signal('');

	timezones: TimezoneOption[] = TIMEZONE_OPTIONS;

	filteredTimezones = computed(() => {
		const term = this.filter().toLowerCase();
		if (!term) return this.timezones;
		return this.timezones.filter(
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

	select(tz: TimezoneOption | null): void {
		this.timezoneChange.emit(tz);
		this.close();
	}
}
