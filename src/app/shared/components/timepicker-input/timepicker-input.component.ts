import {
	Component,
	Input,
	Output,
	EventEmitter,
	signal,
	computed,
	HostListener,
	OnInit,
	OnChanges,
	SimpleChanges,
	OnDestroy,
	ViewChild,
	ElementRef,
	ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgbTimepicker, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import {
	TimeModel,
	TimeFormat,
	TIME_FORMAT_LABEL,
	DEFAULT_TIME,
	EdtfService,
} from '@shared/services/edtf-service/edtf.service';

@Component({
	selector: 'pr-timepicker-input',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, NgbTimepicker],
	templateUrl: './timepicker-input.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./timepicker-input.component.scss'],
})
export class TimepickerInputComponent implements OnInit, OnChanges, OnDestroy {
	@Input() time: TimeModel = DEFAULT_TIME;
	@Input() disabled = false;

	@Output() timeChange = new EventEmitter<TimeModel>();

	@ViewChild('hoursInput') hoursInput!: ElementRef<HTMLInputElement>;
	@ViewChild('minutesInput') minutesInput!: ElementRef<HTMLInputElement>;
	@ViewChild('secondsInput') secondsInput?: ElementRef<HTMLInputElement>;

	showTimepicker = signal(false);
	timepickerControl = new FormControl<NgbTimeStruct | null>(null);

	private readonly timeSignal = signal<TimeModel>(DEFAULT_TIME);
	private readonly FORMAT_CYCLE: TimeFormat[] = ['am', 'pm', 'h24'];

	formatLabel = computed(() => TIME_FORMAT_LABEL[this.timeSignal().format]);
	is24Hour = computed(() => this.timeSignal().format === 'h24');

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
			this.timeSignal.set(this.time);
			const model = this.edtfService.parseTimeAs24Hour(this.time);
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

		const minutes = String(ngbTime.minute).padStart(2, '0');
		const seconds = String(ngbTime.second ?? 0).padStart(2, '0');

		if (this.is24Hour()) {
			this.timeChange.emit({
				...this.time,
				hours: String(ngbTime.hour).padStart(2, '0'),
				minutes,
				seconds,
				format: 'h24',
			});
			return;
		}

		const isPm = ngbTime.hour >= 12;
		const displayHour = ngbTime.hour % 12 || 12;

		this.timeChange.emit({
			...this.time,
			hours: String(displayHour).padStart(2, '0'),
			minutes,
			seconds,
			format: isPm ? 'pm' : 'am',
		});
	}

	cycleFormat(): void {
		const currentIndex = this.FORMAT_CYCLE.indexOf(this.time.format);
		const nextFormat =
			this.FORMAT_CYCLE[(currentIndex + 1) % this.FORMAT_CYCLE.length];
		this.timeChange.emit({ ...this.time, format: nextFormat });
	}

	onMinutesKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Backspace') return;
		const target = event.target as HTMLInputElement;
		if (target.value !== '') return;
		event.preventDefault();
		const newHours = (this.time.hours ?? '').slice(0, -1);
		this.timeChange.emit({ ...this.time, hours: newHours });
		this.hoursInput.nativeElement.focus();
	}

	onSecondsKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Backspace') return;
		const target = event.target as HTMLInputElement;
		if (target.value !== '') return;
		event.preventDefault();
		const newMinutes = (this.time.minutes ?? '').slice(0, -1);
		this.timeChange.emit({ ...this.time, minutes: newMinutes });
		this.minutesInput.nativeElement.focus();
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
					? this.edtfService.isValidHour(value, this.is24Hour())
					: this.edtfService.isValidMinutesSeconds(value);
			if (!isValid) {
				input.value = this.time[timePropKey] ?? '';
				return;
			}
		}

		this.timeChange.emit({ ...this.time, [timePropKey]: value });

		if (nextField && value.length === 2) {
			const isComplete =
				timePropKey === 'hours'
					? this.edtfService.isValidHour(value, this.is24Hour())
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
