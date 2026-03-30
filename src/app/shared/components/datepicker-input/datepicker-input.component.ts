import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	HostListener,
	ElementRef,
	ViewChild,
	OnChanges,
	SimpleChanges,
	OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDatepicker, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateModel, EdtfService } from '@shared/services/edtf-service/edtf.service';

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

	@ViewChild('monthInput') monthInput!: ElementRef<HTMLInputElement>;
	@ViewChild('dayInput') dayInput!: ElementRef<HTMLInputElement>;

	showDatepicker = signal(false);
	datepickerModel = signal<NgbDateStruct | null>(null);

	constructor(
		private elementRef: ElementRef,
		private edtfService: EdtfService,
	) {}

	ngOnInit(): void {
		this.updateDatepickerModel(this.date);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['date']) {
			this.updateDatepickerModel(this.date);
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

		const testDate = { ...this.date, year: value };
		if (!this.edtfService.isValidYear(testDate)) {
			input.value = this.date.year;
			return;
		}

		if (value.length === 4 || value.length === 0) {
			this.dateChange.emit({ ...this.date, year: value });
			this.monthInput.nativeElement.focus();
		}
	}

	updateMonth(event: Event): void {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		const testDate = { ...this.date, month: value };
		if (!this.edtfService.isValidMonth(testDate)) {
			input.value = this.date.month;
			return;
		}

		if (value.length === 2 || value.length === 0) {
			this.dateChange.emit({ ...this.date, month: value });
			this.dayInput.nativeElement.focus();
		}
	}

	updateDay(event: Event): void {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		const testDate = { ...this.date, day: value };
		if (!this.edtfService.isValidDay(testDate)) {
			input.value = this.date.day;
			return;
		}

		if (value.length === 2 || value.length === 0) {
			this.dateChange.emit({ ...this.date, day: value });
		}
	}

	onDateSelect(newDate: NgbDateStruct): void {

		this.datepickerModel.set(newDate);
		const updatedDate = {
			year: String(newDate.year),
			month: String(newDate.month).padStart(2, '0'),
			day: String(newDate.day).padStart(2, '0'),
		};
		this.date = updatedDate;
		this.dateChange.emit(updatedDate);
		this.showDatepicker.set(false);
	}
}
