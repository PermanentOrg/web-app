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
	parseEdtf,
	formatEdtfDate,
} from '@shared/services/edtf-date/edtf-date.service';
import {
	DatepickerInputComponent,
	DateInputObject,
} from '@shared/components/datepicker-input/datepicker-input.component';
import {
	TimepickerInputComponent,
	TimeInputObject,
} from '@shared/components/timepicker-input/timepicker-input.component';
import {
	TimezoneDropdownComponent,
	TimezoneOption,
} from '@shared/components/timezone-dropdown/timezone-dropdown.component';
import {
	Meridian,
	EditDateModel,
	DateObject,
	TimeObject,
	DateQualifierObject,
} from '../edit-date-time-modal/edit-date-time.model';
import { EditDateTimeMappingService } from '../edit-date-time-modal/edit-date-time-mapping.service';

export interface SaveDateResult {
	displayDT: string;
	displayEndDT?: string | null;
}

const EMPTY_DATE: DateObject = { year: '', month: '', day: '' };

const EMPTY_TIME: TimeObject = {
	hours: '',
	minutes: '',
	seconds: '',
	amPm: Meridian.AM,
	timezoneOffset: '',
	timezoneName: '',
};

const EMPTY_QUALIFIERS: DateQualifierObject = {
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
	@Input() displayDT: string | null = null;
	@Input() displayEndDT: string | null = null;
	@Input() disabled = false;

	@Output() saveClicked = new EventEmitter<SaveDateResult>();
	@Output() moreOptionsClicked = new EventEmitter<EditDateModel>();

	@ViewChild('sidebarDatePickerContainer')
	container?: ElementRef<HTMLElement>;

	isDropdownOpen = signal(false);

	_date = signal<DateObject>({ ...EMPTY_DATE });
	_time = signal<TimeObject>({ ...EMPTY_TIME });
	_endDate = signal<DateObject>({ ...EMPTY_DATE });
	_endTime = signal<TimeObject>({ ...EMPTY_TIME });
	_qualifiers = signal<DateQualifierObject>({ ...EMPTY_QUALIFIERS });

	activeQualifiers = computed(() => {
		const q = this._qualifiers();
		const active: string[] = [];
		if (q.approximate) active.push('Approximate');
		if (q.uncertain) active.push('Uncertain');
		if (q.unknown) active.push('Unknown');
		return active;
	});

	stringStartDate = computed(() => {
		if (this._qualifiers().unknown) return 'xxxx-xx-xx';
		return this.computeDateString(this._date(), this._time());
	});

	stringEndDate = computed(() =>
		this.computeDateString(this._endDate(), this._endTime()),
	);

	ngOnInit(): void {
		this.updateDateValue();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.displayDT || changes.displayEndDT) {
			this.updateDateValue();
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
		this.updateDateValue();
		this.isDropdownOpen.set(true);
	}

	onDateChange(newDate: DateInputObject): void {
		this._date.set(newDate);
	}

	onTimeChange(newTime: TimeInputObject): void {
		this._time.update((t) => ({
			...t,
			hours: newTime.hours,
			minutes: newTime.minutes,
			seconds: newTime.seconds,
			amPm: newTime.amPm,
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
		const currentValue = this.buildDateTimeObject();
		this.isDropdownOpen.set(false);

		const modalData: EditDateModel = {
			qualifiers: { ...this._qualifiers() },
			date: { ...currentValue.date },
			time: { ...currentValue.time },
		};

		const endDate = this._endDate();
		if (endDate.year || endDate.month || endDate.day) {
			modalData.endDate = { ...endDate };
			modalData.endTime = { ...this._endTime() };
		}

		this.moreOptionsClicked.emit(modalData);
	}

	onCancel(): void {
		this.updateDateValue();
		this.isDropdownOpen.set(false);
	}

	onSave(): void {
		const newValue = this.buildDateTimeObject();
		const saveResult: SaveDateResult = {
			displayDT: this.buildDisplayDT(newValue.date, newValue.time),
		};

		const endDate = this._endDate();
		if (endDate.year || endDate.month || endDate.day) {
			saveResult.displayEndDT = this.buildDisplayDT(endDate, this._endTime());
		}

		this.saveClicked.emit(saveResult);
		this.isDropdownOpen.set(false);
	}

	private updateDateValue(): void {
		const parsed = this.parseDate(this.displayDT);
		this._date.set(parsed?.date ?? { ...EMPTY_DATE });
		this._time.set(parsed?.time ?? { ...EMPTY_TIME });

		const parsedQualifiers = parsed?.qualifiers;
		if (
			parsedQualifiers &&
			(parsedQualifiers.approximate ||
				parsedQualifiers.uncertain ||
				parsedQualifiers.unknown)
		) {
			this._qualifiers.set(parsedQualifiers);
		}

		const parsedEnd = this.parseDate(this.displayEndDT);
		this._endDate.set(parsedEnd?.date ?? { ...EMPTY_DATE });
		this._endTime.set(parsedEnd?.time ?? { ...EMPTY_TIME });
	}

	private parseDate(input: string | null): {
		date: DateObject;
		time: TimeObject;
		qualifiers: DateQualifierObject;
	} | null {
		try {
			const parsed = parseEdtf(input);
			const values = parsed.values;

			const year = values[0] == null ? '' : String(values[0]);
			const month =
				values[1] == null ? '' : String(values[1] + 1).padStart(2, '0');
			const day = values[2] == null ? '' : String(values[2]).padStart(2, '0');

			let hours = '';
			let minutes = '';
			let seconds = '';
			let amPm = Meridian.AM;
			let timezoneOffset = '';
			let timezoneName = '';

			if (values.length > 3) {
				const converted = EditDateTimeMappingService.to12Hour(values[3]);
				hours = converted.hours;
				amPm = converted.amPm;
				minutes = values[4] == null ? '' : String(values[4]).padStart(2, '0');
				seconds = values[5] == null ? '' : String(values[5]).padStart(2, '0');
			}

			if (parsed.offset !== undefined && parsed.offset !== null) {
				const totalMinutes = Math.abs(parsed.offset);
				const hrs = Math.floor(totalMinutes / 60);
				const mins = totalMinutes % 60;
				const sign = parsed.offset >= 0 ? '+' : '-';
				timezoneOffset = `GMT${sign}${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
				timezoneName =
					EditDateTimeMappingService.offsetToAbbreviation(timezoneOffset);
			}

			return {
				date: { year, month, day },
				time: {
					hours,
					minutes,
					seconds,
					amPm,
					timezoneOffset,
					timezoneName,
				},
				qualifiers: {
					approximate: !!parsed.approximate,
					uncertain: !!parsed.uncertain,
					unknown: false,
				},
			};
		} catch {
			return null;
		}
	}

	private buildDateTimeObject(): EditDateModel {
		return {
			date: { ...this._date() },
			time: { ...this._time() },
		};
	}

	private computeDateString(date: DateObject, time: TimeObject): string {
		const hasYear = !!date.year;
		const hasMonth = !!date.month;
		const hasDay = !!date.day && parseInt(date.day, 10) > 0;

		if (!hasYear && !hasMonth && !hasDay) return '';

		let dateStr = '';

		if (hasYear) {
			const parts = [date.year.padStart(4, '0')];
			if (hasMonth) parts.push(date.month.padStart(2, '0'));
			if (hasDay) parts.push(date.day.padStart(2, '0'));

			dateStr = formatEdtfDate(
				parts.join('-'),
				'en-US',
				hasMonth ? { month: 'long' } : {},
			);
		} else {
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
			dateStr = dateParts.join(' ');
		}

		if (time?.hours) {
			const h = parseInt(time.hours, 10);
			const m = (time.minutes || '00').padStart(2, '0');
			const s = (time.seconds || '00').padStart(2, '0');
			const timeStr = `${h}:${m}:${s} ${time.amPm}`;
			const tz = time.timezoneName || '';
			const fullTime = tz ? `${timeStr} ${tz}` : timeStr;
			return dateStr ? `${dateStr} \u00B7 ${fullTime}` : fullTime;
		}

		return dateStr;
	}

	private buildDisplayDT(date: DateObject, time: TimeObject): string {
		return EditDateTimeMappingService.buildDisplayDT(date, time);
	}
}
