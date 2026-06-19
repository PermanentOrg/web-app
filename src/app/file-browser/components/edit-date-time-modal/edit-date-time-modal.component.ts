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
import {
	EdtfService,
	DateQualifier,
	DateQualifierFlags,
	DateModel,
	TimeModel,
	DateTimeModel,
	DEFAULT_TIME,
	DEFAULT_DATE_QUALIFIERS,
	UNKNOWN_VALUE,
} from '@shared/services/edtf-service/edtf.service';

interface SavedSideState {
	qualifiers: DateQualifierFlags;
	date: DateModel;
	time: TimeModel;
}

@Component({
	selector: 'pr-edit-date-time-modal',
	standalone: true,
	imports: [
		CommonModule,
		NgbTooltipModule,
		DatepickerInputComponent,
		TimepickerInputComponent,
	],
	templateUrl: './edit-date-time-modal.component.html',
	styleUrls: ['./edit-date-time-modal.component.scss'],
})
export class EditDateTimeModalComponent implements OnInit {
	readonly DateQualifier = DateQualifier;

	qualifiers = signal<DateQualifierFlags>({ ...DEFAULT_DATE_QUALIFIERS });

	endQualifiers = signal<DateQualifierFlags>({ ...DEFAULT_DATE_QUALIFIERS });

	savedStartState = signal<SavedSideState | null>(null);
	savedEndState = signal<SavedSideState | null>(null);

	startFieldsDisabled = computed(() => this.qualifiers().unknown);
	endFieldsDisabled = computed(() => this.endQualifiers().unknown);

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
		if (!this.useDateRange() && this.qualifiers().unknown) {
			return { value: UNKNOWN_VALUE, valid: true, errorMessage: '' };
		}

		const dateTimeModel: DateTimeModel = {
			date: this.date(),
			time: this.time(),
			qualifiers: { ...this.qualifiers() },
		};

		if (this.useDateRange()) {
			dateTimeModel.endDate = this.endDate();
			dateTimeModel.endTime = this.endTime();
			dateTimeModel.endQualifiers = { ...this.endQualifiers() };
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

	constructor(
		public dialogRef: DialogRef<DateTimeModel>,
		@Inject(DIALOG_DATA) public data: DateTimeModel,
		private edtfService: EdtfService,
	) {}

	ngOnInit(): void {
		if (this.data) {
			this.qualifiers.set(
				this.data.qualifiers ?? { ...DEFAULT_DATE_QUALIFIERS },
			);
			this.date.set(this.data.date ?? { year: '', month: '', day: '' });
			this.time.set(this.data.time ?? { ...DEFAULT_TIME });

			if (this.data.endDate) {
				this.useDateRange.set(true);
				this.endDate.set(this.data.endDate);
				this.endTime.set(this.data.endTime ?? { ...DEFAULT_TIME });
				this.endQualifiers.set(
					this.data.endQualifiers ?? { ...DEFAULT_DATE_QUALIFIERS },
				);
			}

			if (this.data.qualifiers?.unknown) {
				this.savedStartState.set({
					qualifiers: { ...DEFAULT_DATE_QUALIFIERS },
					date: { ...this.date() },
					time: { ...this.time() },
				});
			}

			if (this.data.endQualifiers?.unknown) {
				this.savedEndState.set({
					qualifiers: { ...DEFAULT_DATE_QUALIFIERS },
					date: { ...this.endDate() },
					time: { ...this.endTime() },
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
			format: timeInputValue.format,
		}));
	}

	onQualifierChange(newDateQualifier: DateQualifier, isEnd: boolean): void {
		const qualifierSignal = isEnd ? this.endQualifiers : this.qualifiers;
		const dateSignal = isEnd ? this.endDate : this.date;
		const timeSignal = isEnd ? this.endTime : this.time;
		const savedStateSignal = isEnd ? this.savedEndState : this.savedStartState;

		const currentQualifiers = qualifierSignal();

		if (newDateQualifier === DateQualifier.Unknown) {
			if (currentQualifiers.unknown) {
				this.restoreSide(
					qualifierSignal,
					dateSignal,
					timeSignal,
					savedStateSignal,
				);
			} else {
				this.saveSide(
					qualifierSignal,
					dateSignal,
					timeSignal,
					savedStateSignal,
				);
				qualifierSignal.set({
					approximate: false,
					uncertain: false,
					unknown: true,
				});
				dateSignal.set({ year: '', month: '', day: '' });
				timeSignal.set({ ...DEFAULT_TIME });
			}
			return;
		}

		if (newDateQualifier === DateQualifier.Approximate) {
			qualifierSignal.update((a) => ({
				...a,
				approximate: !a.approximate,
				unknown: !a.approximate || a.uncertain ? false : a.unknown,
			}));
		}

		if (newDateQualifier === DateQualifier.Uncertain) {
			qualifierSignal.update((a) => ({
				...a,
				uncertain: !a.uncertain,
				unknown: a.approximate || !a.uncertain ? false : a.unknown,
			}));
		}
	}

	private saveSide(
		qualifierSignal: WritableSignal<DateQualifierFlags>,
		dateSignal: WritableSignal<DateModel>,
		timeSignal: WritableSignal<TimeModel>,
		savedStateSignal: WritableSignal<SavedSideState | null>,
	): void {
		savedStateSignal.set({
			qualifiers: { ...qualifierSignal() },
			date: { ...dateSignal() },
			time: { ...timeSignal() },
		});
	}

	private restoreSide(
		qualifierSignal: WritableSignal<DateQualifierFlags>,
		dateSignal: WritableSignal<DateModel>,
		timeSignal: WritableSignal<TimeModel>,
		savedStateSignal: WritableSignal<SavedSideState | null>,
	): void {
		const saved = savedStateSignal();
		if (saved) {
			qualifierSignal.set(saved.qualifiers);
			dateSignal.set(saved.date);
			timeSignal.set(saved.time);
			savedStateSignal.set(null);
		} else {
			qualifierSignal.update((a) => ({ ...a, unknown: false }));
		}
	}

	toggleDateRange(): void {
		this.useDateRange.update((v) => !v);
	}

	clearStart(): void {
		this.qualifiers.set({ ...DEFAULT_DATE_QUALIFIERS });
		this.date.set({ year: '', month: '', day: '' });
		this.time.set({ ...DEFAULT_TIME });
		this.savedStartState.set(null);
	}

	clearEnd(): void {
		this.endQualifiers.set({ ...DEFAULT_DATE_QUALIFIERS });
		this.endDate.set({ year: '', month: '', day: '' });
		this.endTime.set({ ...DEFAULT_TIME });
		this.savedEndState.set(null);
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
			newDateModel.endQualifiers = { ...this.endQualifiers() };
			newDateModel.endDate = { ...this.endDate() };
			newDateModel.endTime = { ...this.endTime() };
		}

		this.dialogRef.close(newDateModel);
	}
}
