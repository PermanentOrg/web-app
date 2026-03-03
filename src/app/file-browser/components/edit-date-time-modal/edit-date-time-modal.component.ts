import {
	Component,
	Inject,
	OnInit,
	signal,
	computed,
	WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DatepickerInputComponent } from '@shared/components/datepicker-input/datepicker-input.component';
import {
	TimepickerInputComponent,
	TimeInputObject,
} from '@shared/components/timepicker-input/timepicker-input.component';
import {
	TimezoneDropdownComponent,
	TimezoneOption,
} from '@shared/components/timezone-dropdown/timezone-dropdown.component';
import {
	EditDateModel,
	DateQualifierObject,
	DateObject,
	TimeObject,
	DateQualifier,
	Meridian,
} from './edit-date-time.model';
import { EditDateTimeMappingService } from './edit-date-time-mapping.service';

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
	selector: 'pr-edit-date-time-modal',
	standalone: true,
	imports: [
		CommonModule,
		DatepickerInputComponent,
		TimepickerInputComponent,
		TimezoneDropdownComponent,
	],
	templateUrl: './edit-date-time-modal.component.html',
	styleUrls: ['./edit-date-time-modal.component.scss'],
})
export class EditDateTimeModalComponent implements OnInit {
	readonly DateQualifier = DateQualifier;

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

		let computedEdtfValue = EditDateTimeMappingService.buildEdtf(
			this.date(),
			this.time(),
			this.qualifiers(),
		);

		if (this.useDateRange()) {
			const endEdtf = EditDateTimeMappingService.buildEdtf(
				this.endDate(),
				this.endTime(),
			);

			if (endEdtf) {
				computedEdtfValue += `/${endEdtf}`;
			}
		}

		return computedEdtfValue;
	});

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

	onTimezoneChange(
		timezoneOption: TimezoneOption,
		currentTime: WritableSignal<TimeObject>,
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
