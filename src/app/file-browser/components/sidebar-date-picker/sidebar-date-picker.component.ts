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
import {
	EdtfService,
	Meridian,
	DateTimeModel,
	DateModel,
	TimeModel,
	DateQualifierFlags,
	TimezoneOption,
} from '@shared/services/edtf-service/edtf.service';
import { DatepickerInputComponent } from '@shared/components/datepicker-input/datepicker-input.component';
import {
	TimepickerInputComponent,
} from '@shared/components/timepicker-input/timepicker-input.component';
import {
	TimezoneDropdownComponent,
} from '@shared/components/timezone-dropdown/timezone-dropdown.component';

const EMPTY_DATE: DateModel = { year: '', month: '', day: '' };

const EMPTY_TIME: TimeModel = {
	hours: '',
	minutes: '',
	seconds: '',
	am: true,
	pm: false,
	timezoneOffset: '',
	timezoneName: '',
};

const EMPTY_QUALIFIERS: DateQualifierFlags = {
	approximate: false,
	uncertain: false,
	unknown: false,
};

@Component({
	selector: 'pr-sidebar-date-picker',
	standalone: true,
	imports: [
		CommonModule,
		DatepickerInputComponent,
		TimepickerInputComponent,
		TimezoneDropdownComponent,
	],
	templateUrl: './sidebar-date-picker.component.html',
	styleUrls: ['./sidebar-date-picker.component.scss'],
})
export class SidebarDatePickerComponent implements OnInit, OnChanges {
	@Input() displayTime: DateTimeModel | null;
	@Input() disabled = false;

	constructor(private edtfService: EdtfService) {}

	@Output() saveClicked = new EventEmitter<DateTimeModel>();
	@Output() moreOptionsClicked = new EventEmitter<DateTimeModel>();

	@ViewChild('sidebarDatePickerContainer')
	container?: ElementRef<HTMLElement>;

	isDropdownOpen = signal(false);

	_date = signal<DateModel>({ ...EMPTY_DATE });
	_time = signal<TimeModel>({ ...EMPTY_TIME });
	_endDate = signal<DateModel>({ ...EMPTY_DATE });
	_endTime = signal<TimeModel>({ ...EMPTY_TIME });
	_qualifiers = signal<DateQualifierFlags>({ ...EMPTY_QUALIFIERS });

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
		const date = this._date();
		return !!(date.year || date.month || date.day);
	});

	formattedStartDate = computed(() => {
		if (this._qualifiers().unknown) return 'xxxx-xx-xx';
		return this.formatDate(this._date());
	});

	formattedStartTime = computed(() => this.formatTime(this._time()));

	startTimezone = computed(() => this._time().timezoneName || '');

	// End date/time computed properties
	hasEndDate = computed(() => {
		const date = this._endDate();
		return !!(date.year || date.month || date.day);
	});

	formattedEndDate = computed(() => this.formatDate(this._endDate()));

	formattedEndTime = computed(() => this.formatTime(this._endTime()));

	endTimezone = computed(() => this._endTime().timezoneName || '');

	ngOnInit(): void {
		this.updateFromDisplayTime();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['displayTime']) {
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
			...newTime
		}));
	}

	onTimezoneChange(tz: TimezoneOption): void {
		this._time.update((t) => ({
			...t,
			timezoneOffset: tz.offset,
			timezoneName: tz.name,
		}));
	}

	onMoreOptions(): void {
		this.isDropdownOpen.set(false);

		const modalData: DateTimeModel = {
			qualifiers: { ...this._qualifiers() },
			date: { ...this._date() },
			time: { ...this._time() },
		};

		const endDate = this._endDate();
		if (endDate.year || endDate.month || endDate.day) {
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
		if (endDate.year || endDate.month || endDate.day) {
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
			return;
		}

		this._date.set(this.displayTime.date ? { ...this.displayTime.date } : { ...EMPTY_DATE });
		this._time.set(this.displayTime.time ? { ...this.displayTime.time } : { ...EMPTY_TIME });
		this._qualifiers.set(this.displayTime.qualifiers ? { ...this.displayTime.qualifiers } : { ...EMPTY_QUALIFIERS });
		this._endDate.set(this.displayTime.endDate ? { ...this.displayTime.endDate } : { ...EMPTY_DATE });
		this._endTime.set(this.displayTime.endTime ? { ...this.displayTime.endTime } : { ...EMPTY_TIME });
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

			const formatOptions: Intl.DateTimeFormatOptions = {};
			formatOptions.year = 'numeric';
			if (hasMonth) formatOptions.month = 'long';
			if (hasDay) formatOptions.day = 'numeric';

			const dateObj = new Date(yearNum, monthNum, dayNum);
			if (yearNum >= 0 && yearNum < 100) {
				dateObj.setFullYear(yearNum);
			}

			return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
		}

		const dateParts: string[] = [];
		if (hasMonth) {
			const monthIdx = parseInt(date.month, 10) - 1;
			if (monthIdx >= 0 && monthIdx < 12) {
				dateParts.push(
					new Intl.DateTimeFormat('en-US', {
						month: 'long',
					}).format(new Date(2000, monthIdx)),
				);
			}
		}
		if (hasDay) dateParts.push(date.day);
		return dateParts.join(' ');
	}

	private formatTime(time: TimeModel): string {
		if (!time?.hours) return '';

		const h = parseInt(time.hours, 10);
		const m = (time.minutes || '00').padStart(2, '0');
		const s = (time.seconds || '00').padStart(2, '0');
		const meridian = time.pm ? Meridian.PM : Meridian.AM;
		return `${h}:${m}:${s} ${meridian}`;
	}

}
