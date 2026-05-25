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
	UNKNOWN_VALUE,
} from '@shared/services/edtf-service/edtf.service';
import { TimezoneOption } from '@shared/services/timezone-service/timezone.service';

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

	private edtfResult = computed<{
		value: string;
		valid: boolean;
		errorMessage: string;
	}>(() => {
		if (this.qualifiers().unknown) {
			return { value: UNKNOWN_VALUE, valid: true, errorMessage: '' };
		}

		const dateTimeModel: DateTimeModel = {
			date: this.date(),
			time: this.time(),
			qualifiers: {
				approximate: this.qualifiers().approximate,
				uncertain: this.qualifiers().uncertain,
				unknown: this.qualifiers().unknown,
			},
		};

		if (this.useDateRange()) {
			dateTimeModel.endDate = this.endDate();
			dateTimeModel.endTime = this.endTime();
		}
		try {
			const edtfDate = this.edtfService.toEdtfDate(dateTimeModel);
			return { value: edtfDate, valid: true, errorMessage: '' };
		} catch (error) {
			return {
				value: '',
				valid: false,
				errorMessage: error instanceof Error ? error.message : 'Invalid date',
			};
		}
	});

	edtfValue = computed(() => this.edtfResult().value);
	isEdtfValid = computed(() => this.edtfResult().valid);
	edtfErrorMessage = computed(() => this.edtfResult().errorMessage);

	startReferenceDate = computed(() =>
		this.buildReferenceDate(this.date(), this.time()),
	);
	endReferenceDate = computed(() =>
		this.buildReferenceDate(this.endDate(), this.endTime()),
	);

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
			timezoneName: timezoneOption.ianaZone,
		}));
	}

	private buildReferenceDate(date: DateModel, time: TimeModel): Date {
		const year = parseInt(date?.year ?? '', 10);
		if (Number.isNaN(year)) return new Date();
		const month = date.month ? parseInt(date.month, 10) - 1 : 0;
		const day = date.day ? parseInt(date.day, 10) : 1;
		const time24 = time?.hours
			? this.edtfService.parseTimeAs24Hour(time)
			: null;
		return new Date(
			Date.UTC(
				year,
				month,
				day,
				time24?.hour ?? 0,
				time24?.minute ?? 0,
				time24?.second ?? 0,
			),
		);
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
