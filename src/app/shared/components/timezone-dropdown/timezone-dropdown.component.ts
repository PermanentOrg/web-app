import {
	Component,
	input,
	output,
	signal,
	computed,
	ElementRef,
	ViewChild,
	HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
export interface TimezoneOption {
	offset: string;
	name: string;
}

export const TIMEZONES: TimezoneOption[] = [
	{ offset: 'GMT-12:00', name: 'International Date Line West' },
	{ offset: 'GMT-11:00', name: 'Samoa Standard Time' },
	{ offset: 'GMT-10:00', name: 'Hawaii-Aleutian Standard Time' },
	{ offset: 'GMT-09:00', name: 'Alaska Standard Time' },
	{ offset: 'GMT-08:00', name: 'Pacific Standard Time' },
	{ offset: 'GMT-07:00', name: 'Mountain Standard Time' },
	{ offset: 'GMT-06:00', name: 'Central Standard Time' },
	{ offset: 'GMT-05:00', name: 'Eastern Standard Time' },
	{ offset: 'GMT-04:00', name: 'Atlantic Standard Time' },
	{ offset: 'GMT-03:30', name: 'Newfoundland Standard Time' },
	{ offset: 'GMT-03:00', name: 'Argentina Standard Time' },
	{ offset: 'GMT-02:00', name: 'Mid-Atlantic Standard Time' },
	{ offset: 'GMT-01:00', name: 'Azores Standard Time' },
	{ offset: 'GMT+00:00', name: 'Greenwich Mean Time' },
	{ offset: 'GMT+01:00', name: 'Central European Standard Time' },
	{ offset: 'GMT+02:00', name: 'Eastern European Standard Time' },
	{ offset: 'GMT+03:00', name: 'Moscow Standard Time' },
	{ offset: 'GMT+03:30', name: 'Iran Standard Time' },
	{ offset: 'GMT+04:00', name: 'Gulf Standard Time' },
	{ offset: 'GMT+04:30', name: 'Afghanistan Time' },
	{ offset: 'GMT+05:00', name: 'Pakistan Standard Time' },
	{ offset: 'GMT+05:30', name: 'India Standard Time' },
	{ offset: 'GMT+05:45', name: 'Nepal Time' },
	{ offset: 'GMT+06:00', name: 'Bangladesh Standard Time' },
	{ offset: 'GMT+07:00', name: 'Indochina Time' },
	{ offset: 'GMT+08:00', name: 'China Standard Time' },
	{ offset: 'GMT+09:00', name: 'Japan Standard Time' },
	{ offset: 'GMT+09:30', name: 'Australian Central Standard Time' },
	{ offset: 'GMT+10:00', name: 'Australian Eastern Standard Time' },
	{ offset: 'GMT+11:00', name: 'Solomon Islands Time' },
	{ offset: 'GMT+12:00', name: 'New Zealand Standard Time' },
	{ offset: 'GMT+13:00', name: 'Tonga Standard Time' },
];

@Component({
	selector: 'pr-timezone-dropdown',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './timezone-dropdown.component.html',
	styleUrls: ['./timezone-dropdown.component.scss'],
})
export class TimezoneDropdownComponent {
	selectedOffset = input<string>('');
	selectedName = input<string>('');
	disabled = input<boolean>(false);
	timezoneChange = output<TimezoneOption>();

	@ViewChild('dropdownContainer') dropdownContainer?: ElementRef<HTMLElement>;

	isOpen = signal(false);
	filter = signal('');

	timezones = TIMEZONES;

	filteredTimezones = computed(() => {
		const term = this.filter().toLowerCase();
		if (!term) return this.timezones;
		return this.timezones.filter(
			(tz) =>
				tz.name.toLowerCase().includes(term) ||
				tz.offset.toLowerCase().includes(term),
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
		if (this.disabled()) return;
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
}
