import {
	Component,
	Inject,
	OnInit,
	signal,
	computed,
	WritableSignal,
	HostListener,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatepickerInputComponent } from '@shared/components/datepicker-input/datepicker-input.component';
import {
	TimepickerInputComponent,
	TimeInputObject,
} from '@shared/components/timepicker-input/timepicker-input.component';
import {
	EditDateModel,
	DateQualifierObject,
	DateObject,
	TimeObject,
	TimezoneOption,
	TIMEZONES,
	DateQualifier,
	Meridian,
} from './edit-date-time.model';

type OverlayKey = 'timezoneDropdown' | 'endTimezoneDropdown';

interface SavedFormState {
	qualifiers: DateQualifierObject;
	date: DateObject;
	time: TimeObject;
	endDate: DateObject;
	endTime: TimeObject;
	useDateRange: boolean;
}

const DEFAULT_TIME: TimeObject = {
	hours: '',
	minutes: '',
	seconds: '',
	amPm: Meridian.AM,
	timezoneOffset: '',
	timezoneName: '',
};

@Component({
	selector: 'pr-edit-date-time',
	standalone: true,
	imports: [CommonModule, DatepickerInputComponent, TimepickerInputComponent],
	templateUrl: './edit-date-time.component.html',
	styleUrls: ['./edit-date-time.component.scss'],
})
export class EditDateTimeComponent implements OnInit {
	readonly DateQualifier = DateQualifier;
	timezones = TIMEZONES;
	timezoneFilter = signal('');

	activeOverlay = signal<OverlayKey | null>(null);

	@ViewChild('timezoneRow') timezoneRow?: ElementRef<HTMLElement>;
	@ViewChild('endTimezoneRow') endTimezoneRow?: ElementRef<HTMLElement>;
	qualifiers = signal<DateQualifierObject>({
		approximate: false,
		uncertain: false,
		unknown: false,
	});

	savedFormState = signal<SavedFormState | null>(null);
	fieldsDisabled = computed(() => this.qualifiers().unknown);

	date = signal<DateObject>({ year: '', month: '', day: '' });

	time = signal<TimeObject>({ ...DEFAULT_TIME });

	useDateRange = signal(false);

	endDate = signal<DateObject>({ year: '', month: '', day: '' });

	endTime = signal<TimeObject>({ ...DEFAULT_TIME });

	edtfValue = computed(() => {
		if (this.qualifiers().unknown) {
			return 'xxxx-xx-xx';
		}

		let computedEdtfValue = '';
		const selectedDate = this.date();
		const selectedTime = this.time();

		computedEdtfValue = [
			selectedDate.year,
			selectedDate.month,
			selectedDate.day,
		]
			.filter(Boolean)
			.join('-');
		const timePart = this.buildTimePart(selectedTime);

		if (timePart) {
			computedEdtfValue += `T${timePart}`;
		}

		if (this.useDateRange()) {
			const selectedEndDate = this.endDate();
			const selectedEndTime = this.endTime();
			const endTimePart = this.buildTimePart(selectedEndTime);
			let endEdtf = [
				selectedEndDate.year,
				selectedEndDate.month,
				selectedEndDate.day,
			]
				.filter(Boolean)
				.join('-');

			if (endTimePart) {
				endEdtf += `T${endTimePart}`;
			}

			if (endEdtf) {
				computedEdtfValue += `/${endEdtf}`;
			}
		}

		return computedEdtfValue;
	});

	filteredTimezones = computed(() => {
		const filter = this.timezoneFilter().toLowerCase();
		if (!filter) return this.timezones;
		return this.timezones.filter(
			(tz) =>
				tz.name.toLowerCase().includes(filter) ||
				tz.offset.toLowerCase().includes(filter),
		);
	});

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		const target = event.target as Node;
		const insideTimezone = this.timezoneRow?.nativeElement.contains(target);
		const insideEndTimezone =
			this.endTimezoneRow?.nativeElement.contains(target);

		if (!insideTimezone && !insideEndTimezone) {
			this.closeAllOverlays();
		}
	}

	closeAllOverlays(): void {
		this.activeOverlay.set(null);
		this.timezoneFilter.set('');
	}

	constructor(
		public dialogRef: DialogRef<EditDateModel>,
		@Inject(DIALOG_DATA) public data: EditDateModel,
	) {}

	ngOnInit(): void {
		if (this.data) {
			this.qualifiers.set(
				this.data.qualifiers ?? {
					approximate: false,
					uncertain: false,
					unknown: false,
				},
			);
			this.date.set(this.data.date ?? { year: '', month: '', day: '' });
			this.time.set(this.data.time ?? { ...DEFAULT_TIME });

			if (this.data.endDate) {
				this.useDateRange.set(true);
				this.endDate.set(this.data.endDate);
				this.endTime.set(this.data.endTime ?? { ...DEFAULT_TIME });
			}
		}
	}

	onTimeChange(
		timeInputValue: TimeInputObject,
		currentTime: WritableSignal<TimeObject>,
	): void {
		currentTime.update((t) => ({
			...t,
			hours: timeInputValue.hours,
			minutes: timeInputValue.minutes,
			seconds: timeInputValue.seconds,
			amPm: timeInputValue.amPm,
		}));
	}

	onQualifierChange(newDateQualifier: DateQualifier): void {
		const currentlySelectedQualifiers = this.qualifiers();

		if (newDateQualifier === DateQualifier.Unknown) {
			if (currentlySelectedQualifiers.unknown) {
				this.restoreForm();
			} else {
				this.saveForm();
				this.qualifiers.set({
					approximate: false,
					uncertain: false,
					unknown: true,
				});
				this.resetForm();
			}
			return;
		}

		if (newDateQualifier === DateQualifier.Approximate) {
			this.qualifiers.update((a) => ({
				...a,
				approximate: !a.approximate,
				unknown: !a.approximate || a.uncertain ? false : a.unknown,
			}));
		}

		if (newDateQualifier === DateQualifier.Uncertain) {
			this.qualifiers.update((a) => ({
				...a,
				uncertain: !a.uncertain,
				unknown: a.approximate || !a.uncertain ? false : a.unknown,
			}));
		}
	}

	private saveForm(): void {
		this.savedFormState.set({
			qualifiers: { ...this.qualifiers() },
			date: { ...this.date() },
			time: { ...this.time() },
			endDate: { ...this.endDate() },
			endTime: { ...this.endTime() },
			useDateRange: this.useDateRange(),
		});
	}

	private restoreForm(): void {
		const saved = this.savedFormState();
		if (saved) {
			this.qualifiers.set(saved.qualifiers);
			this.date.set(saved.date);
			this.time.set(saved.time);
			this.endDate.set(saved.endDate);
			this.endTime.set(saved.endTime);
			this.useDateRange.set(saved.useDateRange);
			this.savedFormState.set(null);
		}
	}

	resetForm(): void {
		this.date.set({ year: '', month: '', day: '' });
		this.time.set({ ...DEFAULT_TIME });
		this.endDate.set({ year: '', month: '', day: '' });
		this.endTime.set({ ...DEFAULT_TIME });
		this.useDateRange.set(false);
	}

	toggleDateRange(): void {
		this.useDateRange.update((v) => !v);
	}

	toggleOverlay(key: OverlayKey): void {
		if (this.activeOverlay() === key) {
			this.closeAllOverlays();
		} else {
			this.activeOverlay.set(key);
			this.timezoneFilter.set('');
		}
	}

	selectTimezone(
		timezoneOption: TimezoneOption,
		currentTimezone: WritableSignal<TimeObject>,
	): void {
		currentTimezone.update((t) => ({
			...t,
			timezoneOffset: timezoneOption.offset,
			timezoneName: timezoneOption.name,
		}));
		this.closeAllOverlays();
	}

	private buildTimePart(time: TimeObject): string {
		if (!time.hours) return '';
		const hour12 = parseInt(time.hours, 10);
		const hour24 = this.to24Hour(hour12, time.amPm);
		const hours24 = String(hour24).padStart(2, '0');
		const parts = [hours24, time.minutes, time.seconds].filter(Boolean);
		return parts.length > 1 ? parts.join(':') : '';
	}

	private to24Hour(hour12: number, amPm: Meridian): number {
		if (amPm === Meridian.AM) return hour12 === 12 ? 0 : hour12;
		return hour12 === 12 ? 12 : hour12 + 12;
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	onSave(): void {
		const newDateModel: EditDateModel = {
			qualifiers: { ...this.qualifiers() },
			date: { ...this.date() },
			time: { ...this.time() },
		};

		if (this.useDateRange()) {
			newDateModel.endDate = { ...this.endDate() };
			newDateModel.endTime = { ...this.endTime() };
		}

		this.dialogRef.close(newDateModel);
	}
}
