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
import { Meridian, TimeModel, DEFAULT_TIME, EdtfService } from '@shared/services/edtf-service/edtf.service';

@Component({
	selector: 'pr-timepicker-input',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, NgbTimepicker],
	templateUrl: './timepicker-input.component.html',
	styleUrls: ['./timepicker-input.component.scss'],
})
export class TimepickerInputComponent implements OnInit, OnChanges, OnDestroy {
	@Input() time: TimeModel = DEFAULT_TIME;
	@Input() disabled = false;
	@Input() showSeconds = true;

	@Output() timeChange = new EventEmitter<TimeModel>();

	@ViewChild('secondsInput') secondsInput?: ElementRef<HTMLInputElement>;

	showTimepicker = signal(false);
	timepickerControl = new FormControl<NgbTimeStruct | null>(null);

	private destroy$ = new Subject<void>();

	constructor(
		private elementRef: ElementRef,
		private edtfService: EdtfService,
	) {}

	ngOnInit(): void {
		this.timepickerControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe((ngbTime) => this.onTimeSelect(ngbTime));
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.time) {
			const model = this.edtfService.to24HourTime(this.time);
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

		const isPm = ngbTime.hour >= 12;
		const displayHour = ngbTime.hour % 12 || 12;

		this.timeChange.emit({
			hours: String(displayHour).padStart(2, '0'),
			minutes: String(ngbTime.minute).padStart(2, '0'),
			seconds: this.showSeconds
				? String(ngbTime.second ?? 0).padStart(2, '0')
				: this.time.seconds,
			am: !isPm,
			pm: isPm,
		});
	}

	toggleAmPm(): void {
		this.timeChange.emit({
			...this.time,
			am: this.time.pm,
			pm: this.time.am,
		});
	}

	updateTime(
		event: Event,
		timePropKey: keyof Pick<TimeModel, 'hours' | 'minutes' | 'seconds'>,
		nextField?: HTMLInputElement,
	): void {
		const input = event.target as HTMLInputElement;
		const value = input.value;

		if (value !== '') {
			const isValid =
				timePropKey === 'hours'
					? this.edtfService.isValidHour(value)
					: this.edtfService.isValidMinutesSeconds(value);
			if (!isValid) {
				input.value = this.time[timePropKey];
				return;
			}
		}

		this.timeChange.emit({ ...this.time, [timePropKey]: value });

		if (nextField && value.length === 2) {
			const isComplete =
				timePropKey === 'hours'
					? this.edtfService.isValidHour(value)
					: this.edtfService.isValidMinutesSeconds(value);
			if (isComplete) nextField.focus();
		}
	}

	private ngbTimeEquals(
		a: NgbTimeStruct | null,
		b: NgbTimeStruct | null,
	): boolean {
		if (a === b) return true;
		if (!a || !b) return false;
		return a.hour === b.hour && a.minute === b.minute && a.second === b.second;
	}
}
