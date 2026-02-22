import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	HostListener,
	OnInit,
	OnChanges,
	SimpleChanges,
	OnDestroy,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';

export enum Meridian {
	AM = 'AM',
	PM = 'PM',
}

export interface TimeInputObject {
	hours: string;
	minutes: string;
	seconds: string;
	amPm: Meridian;
}

@Component({
	selector: 'pr-timepicker-input',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, NgbTimepicker],
	templateUrl: './timepicker-input.component.html',
	styleUrls: ['./timepicker-input.component.scss'],
})
export class TimepickerInputComponent implements OnInit, OnChanges, OnDestroy {
	@Input() time: TimeInputObject = {
		hours: '',
		minutes: '',
		seconds: '',
		amPm: Meridian.AM,
	};
	@Input() disabled = false;
	@Input() showSeconds = true;

	@Output() timeChange = new EventEmitter<TimeInputObject>();

	@ViewChild('secondsInput') secondsInput?: ElementRef<HTMLInputElement>;

	showTimepicker = signal(false);
	timepickerControl = new FormControl<NgbTimeStruct | null>(null);

	private destroy$ = new Subject<void>();

	constructor(private elementRef: ElementRef) {}

	ngOnInit(): void {
		this.timepickerControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe((ngbTime) => this.onTimeSelect(ngbTime));
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.time) {
			const model = this.to24HourTime(this.time);
			const current = this.timepickerControl.value;
			if (!this.ngbTimeEquals(model, current)) {
				this.timepickerControl.setValue(model, { emitEvent: false });
			}
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		if (!this.elementRef.nativeElement.contains(event.target)) {
			this.showTimepicker.set(false);
		}
	}

	toggleTimepicker(): void {
		if (this.disabled) return;
		this.showTimepicker.update((v) => !v);
	}

	onTimeSelect(ngbTime: NgbTimeStruct | null): void {
		if (!ngbTime) return;

		const amPm = ngbTime.hour >= 12 ? Meridian.PM : Meridian.AM;
		const displayHour = ngbTime.hour % 12 || 12;

		this.timeChange.emit({
			hours: String(displayHour).padStart(2, '0'),
			minutes: String(ngbTime.minute).padStart(2, '0'),
			seconds: this.showSeconds
				? String(ngbTime.second ?? 0).padStart(2, '0')
				: this.time.seconds,
			amPm,
		});
	}

	toggleAmPm(): void {
		this.timeChange.emit({
			...this.time,
			amPm: this.time.amPm === Meridian.AM ? Meridian.PM : Meridian.AM,
		});
	}

	updateTime(
		event: Event,
		timePropKey: keyof TimeInputObject,
		nextField?: HTMLInputElement,
	): void {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		if (value !== '') {
			const isValid =
				timePropKey === 'hours'
					? this.isValidHour(value)
					: this.isValidMinutesSeconds(value);
			if (!isValid) {
				input.value = this.time[timePropKey];
				return;
			}
		}

		this.timeChange.emit({ ...this.time, [timePropKey]: value });

		if (nextField && value.length === 2) {
			const isComplete =
				timePropKey === 'hours'
					? this.isValidHour(value)
					: this.isValidMinutesSeconds(value);
			if (isComplete) nextField.focus();
		}
	}

	private to24HourTime(time: TimeInputObject): NgbTimeStruct | null {
		const hour = this.to24Hour(parseInt(time.hours, 10), time.amPm);
		const minute = parseInt(time.minutes, 10);
		const second = parseInt(time.seconds, 10);

		if (isNaN(hour) || isNaN(minute)) return null;

		return { hour, minute, second: isNaN(second) ? 0 : second };
	}

	private ngbTimeEquals(
		a: NgbTimeStruct | null,
		b: NgbTimeStruct | null,
	): boolean {
		if (a === b) return true;
		if (!a || !b) return false;
		return a.hour === b.hour && a.minute === b.minute && a.second === b.second;
	}

	private isValidHour(value: string): boolean {
		if (!this.isNumeric(value) || value.length > 2) return false;
		const num = parseInt(value, 10);
		if (value.length === 1) return num >= 0 && num <= 1;
		return num >= 1 && num <= 12;
	}

	private isValidMinutesSeconds(value: string): boolean {
		if (!this.isNumeric(value) || value.length > 2) return false;
		const num = parseInt(value, 10);
		if (value.length === 1) return num >= 0 && num <= 5;
		return num >= 0 && num <= 59;
	}

	private to24Hour(hour12: number, amPm: Meridian): number {
		if (isNaN(hour12)) return NaN;
		if (amPm === Meridian.AM) return hour12 === 12 ? 0 : hour12;
		return hour12 === 12 ? 12 : hour12 + 12;
	}

	private isNumeric(value: string): boolean {
		return /^\d+$/.test(value);
	}
}
