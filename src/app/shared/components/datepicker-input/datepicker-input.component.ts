import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	computed,
	HostListener,
	ElementRef,
	ViewChild,
	OnChanges,
	SimpleChanges,
	OnInit,
	WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {
	DateModel,
	EdtfService,
} from '@shared/services/edtf-service/edtf.service';

export const INVALID_CHARS_ERROR = 'The date contains invalid characters.';

type DateFieldKey = keyof DateModel;

@Component({
	selector: 'pr-datepicker-input',
	standalone: true,
	imports: [CommonModule, NgbDatepicker],
	templateUrl: './datepicker-input.component.html',
	styleUrls: ['./datepicker-input.component.scss'],
})
export class DatepickerInputComponent implements OnInit, OnChanges {
	@Input() date: DateModel = { year: '', month: '', day: '' };
	@Input() disabled = false;

	@Output() dateChange = new EventEmitter<DateModel>();

	@ViewChild('yearInput') yearInput!: ElementRef<HTMLInputElement>;
	@ViewChild('monthInput') monthInput!: ElementRef<HTMLInputElement>;
	@ViewChild('dayInput') dayInput!: ElementRef<HTMLInputElement>;

	showDatepicker = signal(false);
	datepickerModel = signal<NgbDateStruct | null>(null);

	readonly fieldErrors: Record<DateFieldKey, WritableSignal<string | null>> = {
		year: signal<string | null>(null),
		month: signal<string | null>(null),
		day: signal<string | null>(null),
	};
	currentError = computed(
		() =>
			this.fieldErrors.year() ??
			this.fieldErrors.month() ??
			this.fieldErrors.day(),
	);

	constructor(
		private elementRef: ElementRef,
		private edtfService: EdtfService,
	) {}

	ngOnInit(): void {
		this.updateDatepickerModel(this.date);
		this.refreshErrorsFromInput();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.date) {
			this.updateDatepickerModel(this.date);
			this.refreshErrorsFromInput();
		}
	}

	private updateDatepickerModel(date: DateModel): void {
		const year = parseInt(date.year, 10);
		const month = parseInt(date.month || '', 10);
		const day = parseInt(date.day || '', 10);
		if (year && month && day) {
			this.datepickerModel.set({ year, month, day });
		} else {
			this.datepickerModel.set(null);
		}
	}

	private refreshErrorsFromInput(): void {
		(Object.keys(this.fieldErrors) as DateFieldKey[]).forEach((datePropKey) =>
			this.fieldErrors[datePropKey].set(
				this.getFieldError(datePropKey, this.date[datePropKey] ?? ''),
			),
		);
	}

	private getFieldError(
		datePropKey: DateFieldKey,
		value: string,
	): string | null {
		if (datePropKey === 'year') return this.getYearError(value);
		if (datePropKey === 'month') return this.getMonthError(value);
		return this.getDayError(value, this.date.month ?? '');
	}

	private getYearError(value: string): string | null {
		return this.edtfService.getSegmentError(value, {
			invalidCharsMessage: INVALID_CHARS_ERROR,
		});
	}

	private getMonthError(value: string): string | null {
		return this.edtfService.getMonthError(value, {
			invalidCharsMessage: INVALID_CHARS_ERROR,
		});
	}

	private getDayError(value: string, month: string): string | null {
		return this.edtfService.getDayError(value, this.date.year, month, {
			invalidCharsMessage: INVALID_CHARS_ERROR,
		});
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		if (!this.elementRef.nativeElement.contains(event.target)) {
			this.showDatepicker.set(false);
		}
	}

	toggleDatepicker(): void {
		if (this.disabled) return;
		this.showDatepicker.update((v) => !v);
	}

	updateYear(event: Event): void {
		const value = (event.target as HTMLInputElement).value;
		const error = this.getFieldError('year', value);
		this.fieldErrors.year.set(error);

		this.dateChange.emit({ ...this.date, year: value });
		if (!error && value.length === 4) {
			this.monthInput.nativeElement.focus();
		}
	}

	updateMonth(event: Event): void {
		const value = (event.target as HTMLInputElement).value;
		const error = this.getFieldError('month', value);
		this.fieldErrors.month.set(error);

		this.dateChange.emit({ ...this.date, month: value });

		// Re-validate day because its bounds depend on the month.
		this.fieldErrors.day.set(this.getDayError(this.date.day ?? '', value));

		if (!error && value.length === 2) {
			this.dayInput.nativeElement.focus();
		}
	}

	updateDay(event: Event): void {
		const value = (event.target as HTMLInputElement).value;
		this.fieldErrors.day.set(this.getFieldError('day', value));

		this.dateChange.emit({ ...this.date, day: value });
	}

	onMonthKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Backspace') return;
		const target = event.target as HTMLInputElement;
		if (target.value !== '') return;
		event.preventDefault();
		const newYear = (this.date.year ?? '').slice(0, -1);
		this.fieldErrors.year.set(this.getFieldError('year', newYear));
		this.dateChange.emit({ ...this.date, year: newYear });
		this.yearInput.nativeElement.focus();
	}

	onDayKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Backspace') return;
		const target = event.target as HTMLInputElement;
		if (target.value !== '') return;
		event.preventDefault();
		const newMonth = (this.date.month ?? '').slice(0, -1);
		this.fieldErrors.month.set(this.getFieldError('month', newMonth));
		this.fieldErrors.day.set(this.getDayError(this.date.day ?? '', newMonth));
		this.dateChange.emit({ ...this.date, month: newMonth });
		this.monthInput.nativeElement.focus();
	}

	onDateSelect(newDate: NgbDateStruct): void {
		this.datepickerModel.set(newDate);
		const updatedDate = {
			year: String(newDate.year),
			month: String(newDate.month).padStart(2, '0'),
			day: String(newDate.day).padStart(2, '0'),
		};
		this.date = updatedDate;
		Object.values(this.fieldErrors).forEach((fieldError) =>
			fieldError.set(null),
		);
		this.dateChange.emit(updatedDate);
		this.showDatepicker.set(false);
	}
}
