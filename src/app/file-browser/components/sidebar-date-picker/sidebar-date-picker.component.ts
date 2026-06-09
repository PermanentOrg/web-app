import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	computed,
	OnInit,
	OnChanges,
	SimpleChanges,
	HostListener,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import {
	EdtfService,
	TIME_FORMAT_LABEL,
	DateTimeModel,
	DateModel,
	TimeModel,
	DateQualifierFlags,
} from '@shared/services/edtf-service/edtf.service';
import { DatepickerInputComponent } from '@shared/components/datepicker-input/datepicker-input.component';
import { TimepickerInputComponent } from '@shared/components/timepicker-input/timepicker-input.component';

const EMPTY_DATE: DateModel = { year: '', month: '', day: '' };

const EMPTY_TIME: TimeModel = {
	hours: '',
	minutes: '',
	seconds: '',
	format: 'am',
};

const EMPTY_QUALIFIERS: DateQualifierFlags = {
	approximate: false,
	uncertain: false,
	unknown: false,
};

interface SidebarDateRow {
	prefixLabel?: string;
	text?: string;
	date?: string;
	time?: string;
	meridian?: string;
	timezone?: string;
	isEmpty?: boolean;
}

@Component({
	selector: 'pr-sidebar-date-picker',
	standalone: true,
	imports: [CommonModule, DatepickerInputComponent, TimepickerInputComponent],
	templateUrl: './sidebar-date-picker.component.html',
	styleUrls: ['./sidebar-date-picker.component.scss'],
})
export class SidebarDatePickerComponent implements OnInit, OnChanges {
	@Input() displayTime: DateTimeModel | null;
	@Input() disabled = false;

	@Output() saveClicked = new EventEmitter<DateTimeModel>();
	@Output() moreOptionsClicked = new EventEmitter<DateTimeModel>();

	@ViewChild('sidebarDatePickerContainer')
	container?: ElementRef<HTMLElement>;

	constructor(private readonly edtfService: EdtfService) {}

	isDropdownOpen = signal(false);

	_date = signal<DateModel>({ ...EMPTY_DATE });
	_time = signal<TimeModel>({ ...EMPTY_TIME });
	_endDate = signal<DateModel>({ ...EMPTY_DATE });
	_endTime = signal<TimeModel>({ ...EMPTY_TIME });
	_qualifiers = signal<DateQualifierFlags>({ ...EMPTY_QUALIFIERS });
	_endQualifiers = signal<DateQualifierFlags>({ ...EMPTY_QUALIFIERS });
	_isOpenStart = signal(false);
	_isOpenEnd = signal(false);

	activeQualifiers = computed(() => {
		const start = this._qualifiers();
		const end = this._endQualifiers();
		const active: string[] = [];
		if (start.approximate || end.approximate) active.push('Approximate');
		if (start.uncertain || end.uncertain) active.push('Uncertain');
		return active;
	});

	// Start date/time computed properties
	hasStartDate = computed(() => {
		if (this._qualifiers().unknown) return true;
		if (this._isOpenStart()) return true;
		const date = this._date();
		return !!(date.year || date.month || date.day);
	});

	formattedStartDate = computed(() => {
		if (this._qualifiers().unknown) return 'Unknown';
		if (this._isOpenStart()) return '..';
		return this.formatDate(this._date());
	});

	formattedStartTime = computed(() => this.formatTime(this._time()));
	startMeridian = computed(() => {
		const time = this._time();
		if (!time.hours || time.format === 'h24') return '';
		return TIME_FORMAT_LABEL[time.format];
	});

	startTimezone = computed(() =>
		this.edtfService.browserTimezoneAbbreviation(this._date(), this._time()),
	);

	// End date/time computed properties
	hasEndDate = computed(() => {
		if (this._endQualifiers().unknown) return true;
		if (this._isOpenEnd()) return true;
		const date = this._endDate();
		return !!(date.year || date.month || date.day);
	});

	formattedEndDate = computed(() => {
		if (this._endQualifiers().unknown) return 'Unknown';
		if (this._isOpenEnd()) return '..';
		return this.formatDate(this._endDate());
	});

	formattedEndTime = computed(() => this.formatTime(this._endTime()));
	endMeridian = computed(() => {
		const time = this._endTime();
		if (!time.hours || time.format === 'h24') return '';
		return TIME_FORMAT_LABEL[time.format];
	});

	endTimezone = computed(() =>
		this.edtfService.browserTimezoneAbbreviation(
			this._endDate(),
			this._endTime(),
		),
	);

	intervalLabel = computed(() => {
		if (this._isOpenStart()) return 'Sometime before';
		if (this._isOpenEnd()) return 'Sometime after';
		return null;
	});

	intervalValueDate = computed(() =>
		this._isOpenStart() ? this.formattedEndDate() : this.formattedStartDate(),
	);
	intervalValueTime = computed(() =>
		this._isOpenStart() ? this.formattedEndTime() : this.formattedStartTime(),
	);
	intervalValueMeridian = computed(() =>
		this._isOpenStart() ? this.endMeridian() : this.startMeridian(),
	);
	intervalValueTimezone = computed(() =>
		this._isOpenStart() ? this.endTimezone() : this.startTimezone(),
	);

	rows = computed<SidebarDateRow[]>(() => {
		const intervalLabel = this.intervalLabel();
		if (intervalLabel) {
			return [
				{ text: intervalLabel },
				{
					date: this.intervalValueDate(),
					time: this.intervalValueTime(),
					meridian: this.intervalValueMeridian(),
					timezone: this.intervalValueTimezone(),
				},
			];
		}

		const isInterval = this.hasEndDate();
		const startRow: SidebarDateRow = {
			prefixLabel: isInterval ? 'From' : undefined,
		};
		if (this.hasStartDate()) {
			startRow.date = this.formattedStartDate();
			startRow.time = this.formattedStartTime();
			startRow.meridian = this.startMeridian();
			startRow.timezone = this.startTimezone();
		} else {
			startRow.isEmpty = true;
		}

		if (!isInterval) return [startRow];

		return [
			startRow,
			{
				prefixLabel: 'To',
				date: this.formattedEndDate(),
				time: this.formattedEndTime(),
				meridian: this.endMeridian(),
				timezone: this.endTimezone(),
			},
		];
	});

	ngOnInit(): void {
		this.updateFromDisplayTime();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.displayTime && !this.isDropdownOpen()) {
			this.updateFromDisplayTime();
		}
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		const target = event.target as Node;
		if (
			this.isDropdownOpen() &&
			this.container &&
			target.isConnected &&
			!this.container.nativeElement.contains(target)
		) {
			this.onCancel();
		}
	}

	toggle(): void {
		if (this.disabled) return;
		if (
			this.hasEndDate() ||
			this.hasAnyQualifier(this._qualifiers()) ||
			this.hasAnyQualifier(this._endQualifiers())
		) {
			this.onMoreOptions();
			return;
		}
		if (this.isDropdownOpen()) {
			this.onCancel();
		} else {
			this.open();
		}
	}

	open(): void {
		if (this.disabled) return;
		this.updateFromDisplayTime();
		this.isDropdownOpen.set(true);
	}

	onDateChange(newDate: DateModel): void {
		this._date.set(newDate);
	}

	onTimeChange(newTime: TimeModel): void {
		this._time.update((t) => ({
			...t,
			...newTime,
		}));
	}

	clearAll(): void {
		this._date.set({ ...EMPTY_DATE });
		this._time.set({ ...EMPTY_TIME });
		this._endDate.set({ ...EMPTY_DATE });
		this._endTime.set({ ...EMPTY_TIME });
		this._qualifiers.set({ ...EMPTY_QUALIFIERS });
		this._endQualifiers.set({ ...EMPTY_QUALIFIERS });
		this._isOpenStart.set(false);
		this._isOpenEnd.set(false);
	}

	onMoreOptions(): void {
		this.isDropdownOpen.set(false);

		const modalData: DateTimeModel = {
			qualifiers: { ...this._qualifiers() },
			date: { ...this._date() },
			time: { ...this._time() },
			...(this.buildEndSide() ?? {}),
		};

		this.moreOptionsClicked.emit(modalData);
	}

	onCancel(): void {
		this.updateFromDisplayTime();
		this.isDropdownOpen.set(false);
	}

	onSave(): void {
		const dateTimeModel: DateTimeModel = {
			qualifiers: { ...this._qualifiers() },
			date: { ...this._date() },
			time: { ...this._time() },
			...(this.buildEndSide() ?? {}),
		};

		this.saveClicked.emit(dateTimeModel);
		this.isDropdownOpen.set(false);
	}

	private hasAnyQualifier(flags: DateQualifierFlags): boolean {
		return flags.approximate || flags.uncertain || flags.unknown;
	}

	private buildEndSide(): Pick<
		DateTimeModel,
		'endQualifiers' | 'endDate' | 'endTime'
	> | null {
		const endDate = this._endDate();
		const endQualifiers = this._endQualifiers();
		const hasEnd =
			!!(endDate.year || endDate.month || endDate.day) ||
			this._isOpenEnd() ||
			this.hasAnyQualifier(endQualifiers);
		if (!hasEnd) return null;
		return {
			endQualifiers: { ...endQualifiers },
			endDate: { ...endDate },
			endTime: { ...this._endTime() },
		};
	}

	private updateFromDisplayTime(): void {
		if (!this.displayTime) {
			this._date.set({ ...EMPTY_DATE });
			this._time.set({ ...EMPTY_TIME });
			this._endDate.set({ ...EMPTY_DATE });
			this._endTime.set({ ...EMPTY_TIME });
			this._qualifiers.set({ ...EMPTY_QUALIFIERS });
			this._endQualifiers.set({ ...EMPTY_QUALIFIERS });
			this._isOpenStart.set(false);
			this._isOpenEnd.set(false);
			return;
		}

		const startDate = this.displayTime.date ?? { ...EMPTY_DATE };
		const endDate = this.displayTime.endDate;
		const startQualifiers = this.displayTime.qualifiers ?? EMPTY_QUALIFIERS;
		const endQualifiers = this.displayTime.endQualifiers ?? EMPTY_QUALIFIERS;
		const isInterval = !!endDate;
		const isStartEmpty = !startDate.year && !startDate.month && !startDate.day;
		const isEndEmpty =
			isInterval && !endDate.year && !endDate.month && !endDate.day;

		this._isOpenStart.set(
			isInterval && isStartEmpty && !startQualifiers.unknown,
		);
		this._isOpenEnd.set(isEndEmpty && !endQualifiers.unknown);

		this._date.set({ ...startDate });
		this._time.set(
			this.displayTime.time ? { ...this.displayTime.time } : { ...EMPTY_TIME },
		);
		this._qualifiers.set({ ...startQualifiers });
		this._endQualifiers.set({ ...endQualifiers });
		this._endDate.set(endDate ? { ...endDate } : { ...EMPTY_DATE });
		this._endTime.set(
			this.displayTime.endTime
				? { ...this.displayTime.endTime }
				: { ...EMPTY_TIME },
		);
	}

	private padDigitsWithX(value: string, width: number): string {
		const v = value ?? '';
		return v.length >= width ? v : v + 'X'.repeat(width - v.length);
	}

	private formatDate(date: DateModel): string {
		const yearRaw = date.year ?? '';
		const monthRaw = date.month ?? '';
		const dayRaw = date.day ?? '';

		const hasYear = !!yearRaw;
		const hasMonth = !!monthRaw;
		const hasDay = !!dayRaw && parseInt(dayRaw, 10) !== 0;

		if (!hasYear && !hasMonth && !hasDay) return '';

		const yearDisplay = this.padDigitsWithX(yearRaw, 4);
		const monthComplete = /^\d{2}$/.test(monthRaw);
		const monthName = monthComplete
			? format(new Date(2000, parseInt(monthRaw, 10) - 1), 'MMMM')
			: null;
		const dayDisplay = hasDay ? this.padDigitsWithX(dayRaw, 2) : '';

		if (monthName && hasDay)
			return `${monthName} ${dayDisplay}, ${yearDisplay}`;
		if (monthName) return `${monthName} ${yearDisplay}`;
		if (!hasMonth && !hasDay) return yearDisplay;

		const monthDisplay = hasMonth ? this.padDigitsWithX(monthRaw, 2) : 'XX';
		const parts: string[] = [yearDisplay, monthDisplay];
		if (hasDay) parts.push(dayDisplay);
		return parts.join('-');
	}

	private formatTime(time: TimeModel): string {
		if (!time?.hours) return '';

		const h = time.hours.padStart(2, '0');
		const m = (time.minutes || '00').padStart(2, '0');
		const s = (time.seconds || '00').padStart(2, '0');
		return `${h}:${m}:${s}`;
	}
}
