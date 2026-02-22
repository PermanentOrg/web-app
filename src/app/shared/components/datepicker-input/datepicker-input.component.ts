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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export interface DateInputObject {
	year: string;
	month: string;
	day: string;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

@Component({
	selector: 'pr-datepicker-input',
	standalone: true,
	imports: [CommonModule, NgbDatepicker],
	templateUrl: './datepicker-input.component.html',
	styleUrls: ['./datepicker-input.component.scss'],
})
export class DatepickerInputComponent {
	@Input() date: DateInputObject = { year: '', month: '', day: '' };
	@Input() disabled = false;

	@Output() dateChange = new EventEmitter<DateInputObject>();

	@ViewChild('monthInput') monthInput!: ElementRef<HTMLInputElement>;
	@ViewChild('dayInput') dayInput!: ElementRef<HTMLInputElement>;

	showDatepicker = signal(false);

	constructor(private elementRef: ElementRef) {}

	datepickerModel = computed<NgbDateStruct | null>(() => {
		const d = this.date;
		const year = parseInt(d.year, 10);
		const month = parseInt(d.month, 10);
		const day = parseInt(d.day, 10);
		if (year && month && day) {
			return { year, month, day };
		}
		return null;
	});

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
		const input = event.target as HTMLInputElement;
		const value = input.value;

		if (value !== '' && !this.isValidYear(value)) {
			input.value = this.date.year;
			return;
		}

		const updated: DateInputObject = { ...this.date, year: value };
		const maxDay = this.getMaxDaysInMonth(updated.year, updated.month);
		if (updated.day && parseInt(updated.day, 10) > maxDay) {
			updated.day = String(maxDay).padStart(2, '0');
		}

		this.dateChange.emit(updated);

		if (value.length === 4) {
			this.monthInput.nativeElement.focus();
		}
	}

	updateMonth(event: Event): void {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		if (value !== '' && !this.isValidMonth(value)) {
			input.value = this.date.month;
			return;
		}

		const updated: DateInputObject = { ...this.date, month: value };
		const maxDay = this.getMaxDaysInMonth(updated.year, updated.month);
		if (updated.day && parseInt(updated.day, 10) > maxDay) {
			updated.day = String(maxDay).padStart(2, '0');
		}

		this.dateChange.emit(updated);

		const num = parseInt(value, 10);
		if (value.length === 2 && num >= 1 && num <= 12) {
			this.dayInput.nativeElement.focus();
		}
	}

	updateDay(event: Event): void {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		if (value !== '' && !this.isValidDay(this.date, value)) {
			input.value = this.date.day;
			return;
		}

		this.dateChange.emit({ ...this.date, day: value });
	}

	onDateSelect(newDate: NgbDateStruct): void {
		this.dateChange.emit({
			year: String(newDate.year),
			month: String(newDate.month).padStart(2, '0'),
			day: String(newDate.day).padStart(2, '0'),
		});
		this.showDatepicker.set(false);
	}

	private isValidYear(value: string): boolean {
		return this.isNumeric(value) && value.length <= 4 && !value.startsWith('0');
	}

	private isValidMonth(value: string): boolean {
		if (!this.isNumeric(value) || value.length > 2) return false;
		const num = parseInt(value, 10);
		if (value.length === 1) return num >= 0 && num <= 1;
		return num >= 1 && num <= 12;
	}

	private isValidDay(currentDate: DateInputObject, value: string): boolean {
		if (!this.isNumeric(value) || value.length > 2) return false;
		const num = parseInt(value, 10);
		const maxDay = this.getMaxDaysInMonth(currentDate.year, currentDate.month);
		if (value.length === 1) return num >= 0 && num <= Math.floor(maxDay / 10);
		return num >= 1 && num <= maxDay;
	}

	private getMaxDaysInMonth(year: string, month: string): number {
		const y = parseInt(year, 10);
		const m = parseInt(month, 10);

		if (!m || m < 1 || m > 12) return 31;

		if (m === 2 && y) {
			return this.isLeapYear(y) ? 29 : 28;
		}

		return DAYS_IN_MONTH[m - 1];
	}

	private isNumeric(value: string): boolean {
		return /^\d+$/.test(value);
	}

	private isLeapYear(year: number): boolean {
		return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	}
}
