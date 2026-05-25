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
import { format, setYear } from 'date-fns';
import {
	EdtfService,
	Meridian,
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
	am: true,
	pm: false,
};

const EMPTY_QUALIFIERS: DateQualifierFlags = {
	approximate: false,
	uncertain: false,
	unknown: false,
};

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
	_isOpenStart = signal(false);
	_isOpenEnd = signal(false);

	activeQualifiers = computed(() => {
		const q = this._qualifiers();
		const active: string[] = [];
		if (q.approximate) active.push('Approximate');
		if (q.uncertain) active.push('Uncertain');
		if (q.unknown) active.push('Unknown');
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
		if (this._qualifiers().unknown) return 'Unknown date and time';
		if (this._isOpenStart()) return '..';
		return this.formatDate(this._date());
	});

	formattedStartTime = computed(() => this.formatTime(this._time()));
	startMeridian = computed(() =>
		this._time().hours ? (this._time().pm ? Meridian.PM : Meridian.AM) : '',
	);

	startTimezone = computed(() =>
		this.edtfService.browserTimezoneAbbreviation(this._date(), this._time()),
	);

	// End date/time computed properties
	hasEndDate = computed(() => {
		if (this._isOpenEnd()) return true;
		const date = this._endDate();
		return !!(date.year || date.month || date.day);
	});

	formattedEndDate = computed(() => {
		if (this._isOpenEnd()) return '..';
		return this.formatDate(this._endDate());
	});

	formattedEndTime = computed(() => this.formatTime(this._endTime()));
	endMeridian = computed(() =>
		this._endTime().hours
			? this._endTime().pm
				? Meridian.PM
				: Meridian.AM
			: '',
	);

	endTimezone = computed(() =>
		this.edtfService.browserTimezoneAbbreviation(
			this._endDate(),
			this._endTime(),
		),
	);

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
		const q = this._qualifiers();
		if (this.hasEndDate() || q.unknown || q.approximate || q.uncertain) {
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
		this._isOpenStart.set(false);
		this._isOpenEnd.set(false);
	}

	onMoreOptions(): void {
		this.isDropdownOpen.set(false);

		const modalData: DateTimeModel = {
			qualifiers: { ...this._qualifiers() },
			date: { ...this._date() },
			time: { ...this._time() },
		};

		const endDate = this._endDate();
		if (endDate.year || endDate.month || endDate.day || this._isOpenEnd()) {
			modalData.endDate = { ...endDate };
			modalData.endTime = { ...this._endTime() };
		}

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
		};

		const endDate = this._endDate();
		if (endDate.year || endDate.month || endDate.day || this._isOpenEnd()) {
			dateTimeModel.endDate = { ...endDate };
			dateTimeModel.endTime = { ...this._endTime() };
		}

		this.saveClicked.emit(dateTimeModel);
		this.isDropdownOpen.set(false);
	}

	private updateFromDisplayTime(): void {
		if (!this.displayTime) {
			this._date.set({ ...EMPTY_DATE });
			this._time.set({ ...EMPTY_TIME });
			this._endDate.set({ ...EMPTY_DATE });
			this._endTime.set({ ...EMPTY_TIME });
			this._qualifiers.set({ ...EMPTY_QUALIFIERS });
			this._isOpenStart.set(false);
			this._isOpenEnd.set(false);
			return;
		}

		const startDate = this.displayTime.date ?? { ...EMPTY_DATE };
		const endDate = this.displayTime.endDate;
		const isInterval = !!endDate;
		const isStartEmpty = !startDate.year && !startDate.month && !startDate.day;
		const isEndEmpty =
			isInterval && !endDate.year && !endDate.month && !endDate.day;

		this._isOpenStart.set(isInterval && isStartEmpty);
		this._isOpenEnd.set(isEndEmpty);

		this._date.set({ ...startDate });
		this._time.set(
			this.displayTime.time ? { ...this.displayTime.time } : { ...EMPTY_TIME },
		);
		this._qualifiers.set(
			this.displayTime.qualifiers
				? { ...this.displayTime.qualifiers }
				: { ...EMPTY_QUALIFIERS },
		);
		this._endDate.set(endDate ? { ...endDate } : { ...EMPTY_DATE });
		this._endTime.set(
			this.displayTime.endTime
				? { ...this.displayTime.endTime }
				: { ...EMPTY_TIME },
		);
	}

	private formatDate(date: DateModel): string {
		const hasYear = !!date.year;
		const hasMonth = !!date.month;
		const hasDay = !!date.day && parseInt(date.day, 10) > 0;

		if (!hasYear && !hasMonth && !hasDay) return '';

		if (hasYear) {
			const yearNum = parseInt(date.year, 10);
			const monthNum = hasMonth ? parseInt(date.month, 10) - 1 : 0;
			const dayNum = hasDay ? parseInt(date.day, 10) : 1;

			// setYear avoids the JS Date quirk where years 0-99 are interpreted as 1900-1999
			const dateObj = setYear(new Date(2000, monthNum, dayNum), yearNum);

			if (hasMonth && hasDay) return format(dateObj, 'MMMM d, yyyy');
			if (hasMonth) return format(dateObj, 'MMMM yyyy');
			return format(dateObj, 'yyyy');
		}

		const dateParts: string[] = [];
		if (hasMonth) {
			const monthIdx = parseInt(date.month, 10) - 1;
			if (monthIdx >= 0 && monthIdx < 12) {
				dateParts.push(format(new Date(2000, monthIdx), 'MMMM'));
			}
		}
		if (hasDay) dateParts.push(date.day);
		return dateParts.join(' ');
	}

	private formatTime(time: TimeModel): string {
		if (!time?.hours) return '';

		const h = time.hours.padStart(2, '0');
		const m = (time.minutes || '00').padStart(2, '0');
		const s = (time.seconds || '00').padStart(2, '0');
		return `${h}:${m}:${s}`;
	}
}
