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
	WritableSignal,
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

export const INVALID_CHARS_ERROR = 'The time contains invalid characters.';
export const HOUR_24_RANGE_ERROR = 'Hour must be between 0 and 23.';
export const HOUR_12_RANGE_ERROR = 'Hour must be between 1 and 12.';
export const MINUTES_RANGE_ERROR = 'Minutes must be between 0 and 59.';
export const SECONDS_RANGE_ERROR = 'Seconds must be between 0 and 59.';

type TimeFieldKey = keyof Pick<TimeModel, 'hours' | 'minutes' | 'seconds'>;

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

	readonly fieldErrors: Record<TimeFieldKey, WritableSignal<string | null>> = {
		hours: signal<string | null>(null),
		minutes: signal<string | null>(null),
		seconds: signal<string | null>(null),
	};
	currentError = computed(
		() =>
			this.fieldErrors.hours() ??
			this.fieldErrors.minutes() ??
			this.fieldErrors.seconds(),
	);

	private destroy$ = new Subject<void>();

	constructor(
		private elementRef: ElementRef,
		private edtfService: EdtfService,
	) {}

	ngOnInit(): void {
		this.timepickerControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe((ngbTime) => this.onTimeSelect(ngbTime));
		this.refreshErrorsFromInput();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.time) {
			this.timeSignal.set(this.time);
			const model = this.edtfService.parseTimeAs24Hour(this.time);
			const current = this.timepickerControl.value;
			if (!this.ngbTimeEquals(model, current)) {
				this.timepickerControl.setValue(model, { emitEvent: false });
			}
			this.refreshErrorsFromInput();
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private refreshErrorsFromInput(): void {
		(Object.keys(this.fieldErrors) as TimeFieldKey[]).forEach((timePropKey) =>
			this.fieldErrors[timePropKey].set(
				this.getFieldError(timePropKey, this.time[timePropKey] ?? ''),
			),
		);
	}

	private getFieldError(
		timePropKey: TimeFieldKey,
		value: string,
	): string | null {
		if (timePropKey === 'hours') {
			return this.getHoursError(value, this.is24Hour());
		}
		if (timePropKey === 'minutes') return this.getMinutesError(value);
		return this.getSecondsError(value);
	}

	private getHoursError(value: string, is24Hour: boolean): string | null {
		return this.edtfService.getSegmentError(value, {
			invalidCharsMessage: INVALID_CHARS_ERROR,
			isWithinRange: (hours) => this.edtfService.isValidHour(hours, is24Hour),
			rangeMessage: is24Hour ? HOUR_24_RANGE_ERROR : HOUR_12_RANGE_ERROR,
		});
	}

	private getMinutesError(value: string): string | null {
		return this.edtfService.getSegmentError(value, {
			invalidCharsMessage: INVALID_CHARS_ERROR,
			isWithinRange: (minutes) =>
				this.edtfService.isValidMinutesSeconds(minutes),
			rangeMessage: MINUTES_RANGE_ERROR,
		});
	}

	private getSecondsError(value: string): string | null {
		return this.edtfService.getSegmentError(value, {
			invalidCharsMessage: INVALID_CHARS_ERROR,
			isWithinRange: (seconds) =>
				this.edtfService.isValidMinutesSeconds(seconds),
			rangeMessage: SECONDS_RANGE_ERROR,
		});
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
		// Hour validity depends on the format — re-check against the new format.
		this.fieldErrors.hours.set(
			this.getHoursError(this.time.hours ?? '', nextFormat === 'h24'),
		);
	}

	onMinutesKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Backspace') return;
		const target = event.target as HTMLInputElement;
		if (target.value !== '') return;
		event.preventDefault();
		const newHours = (this.time.hours ?? '').slice(0, -1);
		this.fieldErrors.hours.set(this.getFieldError('hours', newHours));
		this.timeChange.emit({ ...this.time, hours: newHours });
		this.hoursInput.nativeElement.focus();
	}

	onSecondsKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Backspace') return;
		const target = event.target as HTMLInputElement;
		if (target.value !== '') return;
		event.preventDefault();
		const newMinutes = (this.time.minutes ?? '').slice(0, -1);
		this.fieldErrors.minutes.set(this.getFieldError('minutes', newMinutes));
		this.timeChange.emit({ ...this.time, minutes: newMinutes });
		this.minutesInput.nativeElement.focus();
	}

	updateTime(
		event: Event,
		timePropKey: TimeFieldKey,
		nextField?: HTMLInputElement,
	): void {
		const value = (event.target as HTMLInputElement).value;
		const error = this.getFieldError(timePropKey, value);
		this.fieldErrors[timePropKey].set(error);

		this.timeChange.emit({ ...this.time, [timePropKey]: value });

		if (!error && nextField && value.length === 2) {
			nextField.focus();
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
