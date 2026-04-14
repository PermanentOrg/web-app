import {
	Component,
	Inject,
	OnInit,
	signal,
	computed,
	WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatepickerInputComponent } from '@shared/components/datepicker-input/datepicker-input.component';
import { TimepickerInputComponent } from '@shared/components/timepicker-input/timepicker-input.component';
import { TimezoneDropdownComponent } from '@shared/components/timezone-dropdown/timezone-dropdown.component';
import {
	EdtfService,
	DateQualifier,
	DateQualifierFlags,
	DateModel,
	TimeModel,
	DateTimeModel,
	DEFAULT_TIME,
	TimezoneOption,
} from '@shared/services/edtf-service/edtf.service';

@Component({
	selector: 'pr-edit-date-time-modal',
	standalone: true,
	imports: [
		CommonModule,
		NgbTooltipModule,
		DatepickerInputComponent,
		TimepickerInputComponent,
		TimezoneDropdownComponent,
	],
	templateUrl: './edit-date-time-modal.component.html',
	styleUrls: ['./edit-date-time-modal.component.scss'],
})
export class EditDateTimeModalComponent implements OnInit {
	readonly DateQualifier = DateQualifier;

	qualifiers = signal<DateQualifierFlags>({
		approximate: false,
		uncertain: false,
		unknown: false,
	});

	savedFormState = signal<{
		qualifiers: DateQualifierFlags;
		date: DateModel;
		time: TimeModel;
		endDate: DateModel;
		endTime: TimeModel;
		useDateRange: boolean;
	} | null>(null);
	fieldsDisabled = computed(() => this.qualifiers().unknown);

	date = signal<DateModel>({ year: '', month: '', day: '' });

	time = signal<TimeModel>({ ...DEFAULT_TIME });

	useDateRange = signal(false);

	endDate = signal<DateModel>({ year: '', month: '', day: '' });

	endTime = signal<TimeModel>({ ...DEFAULT_TIME });

	edtfValue = computed(() => {
		if (this.qualifiers().unknown) {
			return 'xxxx-xx-xx';
		}

		const dateTimeModel: DateTimeModel = {
			date: this.sanitizeDate(this.date()),
			time: this.sanitizeTime(this.time()),
			qualifiers: {
				approximate: this.qualifiers().approximate,
				uncertain: this.qualifiers().uncertain,
				unknown: this.qualifiers().unknown,
			},
		};

		if (this.useDateRange()) {
			dateTimeModel.endDate = this.sanitizeDate(this.endDate());
			dateTimeModel.endTime = this.sanitizeTime(this.endTime());
		}

		return this.edtfService.toEdtfDate(dateTimeModel);
	});

	constructor(
		public dialogRef: DialogRef<DateTimeModel>,
		@Inject(DIALOG_DATA) public data: DateTimeModel,
		private edtfService: EdtfService,
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

			if (this.data.qualifiers?.unknown) {
				this.savedFormState.set({
					qualifiers: { approximate: false, uncertain: false, unknown: false },
					date: { ...this.date() },
					time: { ...this.time() },
					endDate: { ...this.endDate() },
					endTime: { ...this.endTime() },
					useDateRange: this.useDateRange(),
				});
			}
		}
	}

	onTimeChange(
		timeInputValue: TimeModel,
		currentTime: WritableSignal<TimeModel>,
	): void {
		currentTime.update((t) => ({
			...t,
			hours: timeInputValue.hours,
			minutes: timeInputValue.minutes,
			seconds: timeInputValue.seconds,
			am: timeInputValue.am,
			pm: timeInputValue.pm,
		}));
	}

	onTimezoneChange(
		timezoneOption: TimezoneOption,
		currentTime: WritableSignal<TimeModel>,
	): void {
		currentTime.update((t) => ({
			...t,
			timezoneOffset: timezoneOption.offset,
			timezoneName: timezoneOption.name,
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

	clearAll(): void {
		this.qualifiers.set({
			approximate: false,
			uncertain: false,
			unknown: false,
		});
		this.resetForm();
		this.savedFormState.set(null);
	}

	private sanitizeDate(date: DateModel): DateModel {
		return {
			year: date.year,
			month: date.year ? date.month : '',
			day: date.year && date.month ? date.day : '',
		};
	}

	private sanitizeTime(time: TimeModel): TimeModel {
		if (!time.hours || !this.edtfService.isValidTime(time)) {
			return { ...time, hours: '', minutes: '', seconds: '' };
		}
		return {
			...time,
			minutes: time.minutes || '',
			seconds: time.hours && time.minutes ? time.seconds : '',
		};
	}

	onCancel(): void {
		this.dialogRef.close();
	}

	onSave(): void {
		const newDateModel: DateTimeModel = {
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
