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
import { EditDateTimeModalService } from '../edit-date-time-modal/edit-date-time-modal.service';
import {
	Meridian,
	EditDateModel,
	DateObject,
	TimeObject,
	DateQualifierObject,
} from '../edit-date-time-modal/edit-date-time.model';
import { EditDateTimeMappingService } from '../edit-date-time-modal/edit-date-time-mapping.service';

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

	@Output() saveClicked = new EventEmitter<string>();
	@Output() saveEndDateClicked = new EventEmitter<string | null>();
	@Output() editDateTimeModalClosed = new EventEmitter<void>();

	@ViewChild('sidebarDatePickerContainer')
	container?: ElementRef<HTMLElement>;

	isOpen = signal(false);

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

	formattedFromDate = computed(() => {
		if (this._qualifiers().unknown) return 'xxxx-xx-xx';
		const d = this._date();
		if (!d.year && !d.month && !d.day) return '';
		return this.formatDateDisplay(d, this._time());
	});

	formattedToDate = computed(() => {
		const d = this._endDate();
		if (!d.year && !d.month && !d.day) return '';
		return this.formatDateDisplay(d, this._endTime());
	});

	constructor(private editDateTimeModalService: EditDateTimeModalService) {}

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
		if (
			this.isOpen() &&
			this.container &&
			!this.container.nativeElement.contains(event.target as Node)
		) {
			this.onCancel();
		}
	}

	toggle(): void {
		if (this.disabled) return;
		if (this.isOpen()) {
			this.onCancel();
		} else {
			this.open();
		}
	}

	open(): void {
		if (this.disabled) return;
		this.updateDateValue();
		this.isOpen.set(true);
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
		const currentValue = this.buildValue();
		this.isOpen.set(false);

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

		const dialogRef = this.editDateTimeModalService.open(modalData);

		dialogRef.closed.subscribe((result) => {
			if (result) {
				this._date.set({ ...result.date });
				this._time.set({ ...result.time });
				this._qualifiers.set(
					result.qualifiers ?? { ...EMPTY_QUALIFIERS },
				);
				this.saveClicked.emit(
					this.buildDisplayDT(result.date, result.time),
				);

				if (result.endDate) {
					this._endDate.set({ ...result.endDate });
					this._endTime.set({
						...(result.endTime ?? EMPTY_TIME),
					});
					this.saveEndDateClicked.emit(
						this.buildDisplayDT(
							result.endDate,
							result.endTime ?? EMPTY_TIME,
						),
					);
				} else {
					this._endDate.set({ ...EMPTY_DATE });
					this._endTime.set({ ...EMPTY_TIME });
					this.saveEndDateClicked.emit(null);
				}
			}

			this.isOpen.set(false);
		});

		this.editDateTimeModalClosed.emit();
	}

	onCancel(): void {
		this.updateDateValue();
		this.isOpen.set(false);
	}

	onSave(): void {
		const newValue = this.buildValue();
		this.saveClicked.emit(
			this.buildDisplayDT(newValue.date, newValue.time),
		);
		this.isOpen.set(false);
	}

	private updateDateValue(): void {
		const parsed = this.displayDT
			? EditDateTimeMappingService.parseEdtf(this.displayDT)
			: null;
		this._date.set(parsed?.date ? { ...parsed.date } : { ...EMPTY_DATE });
		this._time.set(parsed?.time ? { ...parsed.time } : { ...EMPTY_TIME });

		const parsedQualifiers = parsed?.qualifiers;
		if (
			parsedQualifiers &&
			(parsedQualifiers.approximate ||
				parsedQualifiers.uncertain ||
				parsedQualifiers.unknown)
		) {
			this._qualifiers.set(parsedQualifiers);
		}

		const parsedEnd = this.displayEndDT
			? EditDateTimeMappingService.parseEdtf(this.displayEndDT)
			: null;
		this._endDate.set(
			parsedEnd?.date ? { ...parsedEnd.date } : { ...EMPTY_DATE },
		);
		this._endTime.set(
			parsedEnd?.time ? { ...parsedEnd.time } : { ...EMPTY_TIME },
		);
	}

	private buildValue(): EditDateModel {
		return {
			date: { ...this._date() },
			time: { ...this._time() },
		};
	}

	private formatDateDisplay(date: DateObject, time: TimeObject): string {
		const dateParts: string[] = [];

		if (date.month) {
			const monthIdx = parseInt(date.month, 10) - 1;
			if (monthIdx >= 0 && monthIdx < 12) {
				const monthName = new Intl.DateTimeFormat('en-US', {
					month: 'long',
				}).format(new Date(2000, monthIdx));
				dateParts.push(monthName);
			}
		}

		if (date.day && parseInt(date.day, 10) > 0) {
			dateParts.push(date.day);
		}

		let dateStr = '';
		if (dateParts.length && date.year) {
			dateStr = `${dateParts.join(' ')}, ${date.year}`;
		} else if (date.year) {
			dateStr = date.year;
		} else if (dateParts.length) {
			dateStr = dateParts.join(' ');
		}

		if (time?.hours) {
			const h = parseInt(time.hours, 10);
			const m = (time.minutes || '00').padStart(2, '0');
			const timeStr = `${h}:${m} ${time.amPm}`;
			const tz = time.timezoneName || '';
			const fullTime = tz ? `${timeStr} ${tz}` : timeStr;
			return dateStr ? `${dateStr} \u00B7 ${fullTime}` : fullTime;
		}

		return dateStr;
	}

	private buildDisplayDT(
		date: { year: string; month: string; day: string },
		time: {
			hours: string;
			minutes: string;
			seconds: string;
			amPm: Meridian;
			timezoneOffset?: string;
		},
	): string {
		const year = date.year.padStart(4, '0');
		const month = (date.month || '01').padStart(2, '0');
		const day = (date.day || '01').padStart(2, '0');

		const hour12 = parseInt(time.hours || '0', 10);
		const hour24 = EditDateTimeMappingService.to24Hour(hour12, time.amPm);

		const hours = String(hour24).padStart(2, '0');
		const minutes = (time.minutes || '00').padStart(2, '0');
		const seconds = (time.seconds || '00').padStart(2, '0');

		const isoOffset = time.timezoneOffset
			? time.timezoneOffset.replace('GMT', '')
			: '+00:00';

		const utcString = new Date(
			`${year}-${month}-${day}T${hours}:${minutes}:${seconds}${isoOffset}`,
		).toISOString();

		const tzSuffix = this.buildTzSuffix(time.timezoneOffset);
		return tzSuffix ? `${utcString}${tzSuffix}` : utcString;
	}

	private buildTzSuffix(tzOffset: string): string {
		if (!tzOffset) return '';
		const match = tzOffset.match(/GMT([+-])(\d{2}):(\d{2})/);
		if (!match) return '';
		const sign = match[1];
		const hrs = parseInt(match[2], 10);
		const mins = parseInt(match[3], 10);
		return mins === 0
			? `${sign}${hrs}`
			: `${sign}${hrs}:${String(mins).padStart(2, '0')}`;
	}
}
