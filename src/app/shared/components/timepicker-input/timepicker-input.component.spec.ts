import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TimeModel } from '@shared/services/edtf-service/edtf.service';
import {
	HOUR_12_RANGE_ERROR,
	HOUR_24_RANGE_ERROR,
	INVALID_CHARS_ERROR,
	MINUTES_RANGE_ERROR,
	SECONDS_RANGE_ERROR,
	TimepickerInputComponent,
} from './timepicker-input.component';

@Component({
	template: `<pr-timepicker-input
		[time]="time"
		[disabled]="disabled"
		(timeChange)="onTimeChange($event)"
	/>`,
	standalone: true,
	imports: [TimepickerInputComponent],
})
class TestHostComponent {
	time: TimeModel = {
		hours: '',
		minutes: '',
		seconds: '',
		format: 'am',
	};
	disabled = false;
	lastEmittedTime: TimeModel | null = null;

	onTimeChange(time: TimeModel): void {
		this.lastEmittedTime = time;
		this.time = time;
	}
}

describe('TimepickerInputComponent', () => {
	let fixture: ComponentFixture<TestHostComponent>;
	let hostComponent: TestHostComponent;
	let component: TimepickerInputComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		hostComponent = fixture.componentInstance;
		fixture.detectChanges();
		component = fixture.debugElement.children[0].componentInstance;
	});

	const mockEvent = (value: string): Event =>
		({ target: { value } }) as unknown as Event;

	const switchToH24 = (): void => {
		hostComponent.time = {
			hours: '',
			minutes: '',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();
	};

	// --- Basic rendering ---

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render time inputs', () => {
		const inputs = fixture.nativeElement.querySelectorAll('.pr-time-segment');

		expect(inputs.length).toBe(3);
	});

	// --- Disabled state ---

	it('should not toggle timepicker when disabled', () => {
		hostComponent.disabled = true;
		fixture.detectChanges();
		component.toggleTimepicker();

		expect(component.showTimepicker()).toBeFalse();
	});

	// --- Timepicker toggle ---

	it('should toggle timepicker', () => {
		component.toggleTimepicker();

		expect(component.showTimepicker()).toBeTrue();
		component.toggleTimepicker();

		expect(component.showTimepicker()).toBeFalse();
	});

	// --- Hour validation (12-hour mode) ---

	it('should accept valid hour and clear hours error', () => {
		component.updateTime(mockEvent('10'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('10');
		expect(component.fieldErrors.hours()).toBeNull();
	});

	it('should emit hour > 12 in 12-hour mode AND surface 1-12 error', () => {
		component.updateTime(mockEvent('13'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('13');
		expect(component.fieldErrors.hours()).toBe(HOUR_12_RANGE_ERROR);
	});

	it('should emit non-numeric hour AND surface the invalid-characters error', () => {
		component.updateTime(mockEvent('ab'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('ab');
		expect(component.fieldErrors.hours()).toBe(INVALID_CHARS_ERROR);
	});

	it('should accept single digit 0 or 1 for hours in 12-hour mode', () => {
		component.updateTime(mockEvent('1'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('1');
		expect(component.fieldErrors.hours()).toBeNull();
	});

	it('should NOT surface the hours range error while only one digit has been typed', () => {
		component.updateTime(mockEvent('2'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('2');
		expect(component.fieldErrors.hours()).toBeNull();
	});

	it('should NOT surface the minutes range error while only one digit has been typed', () => {
		component.updateTime(mockEvent('9'), 'minutes');

		expect(hostComponent.lastEmittedTime?.minutes).toBe('9');
		expect(component.fieldErrors.minutes()).toBeNull();
	});

	it('should NOT surface the seconds range error while only one digit has been typed', () => {
		component.updateTime(mockEvent('9'), 'seconds');

		expect(hostComponent.lastEmittedTime?.seconds).toBe('9');
		expect(component.fieldErrors.seconds()).toBeNull();
	});

	// --- Hour validation (24-hour mode) ---

	it('should accept hours 00-23 in h24 mode', () => {
		switchToH24();

		component.updateTime(mockEvent('00'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('00');
		expect(component.fieldErrors.hours()).toBeNull();

		component.updateTime(mockEvent('23'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('23');
		expect(component.fieldErrors.hours()).toBeNull();
	});

	it('should emit hour 24 in h24 mode AND surface 0-23 error', () => {
		switchToH24();

		component.updateTime(mockEvent('24'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('24');
		expect(component.fieldErrors.hours()).toBe(HOUR_24_RANGE_ERROR);
	});

	it('should re-validate the hour when the format toggles (15 valid in h24, invalid in 12-hour)', () => {
		hostComponent.time = {
			hours: '15',
			minutes: '',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();

		expect(component.fieldErrors.hours()).toBeNull();

		component.cycleFormat();

		expect(component.fieldErrors.hours()).toBe(HOUR_12_RANGE_ERROR);
	});

	it('should clear the hour error when the format toggles to one where the value is valid', () => {
		hostComponent.time = {
			hours: '15',
			minutes: '',
			seconds: '',
			format: 'am',
		};
		fixture.detectChanges();

		expect(component.fieldErrors.hours()).toBe(HOUR_12_RANGE_ERROR);

		// am -> pm: still 12-hour, still invalid
		component.cycleFormat();
		fixture.detectChanges();

		expect(component.fieldErrors.hours()).toBe(HOUR_12_RANGE_ERROR);

		// pm -> h24: now valid
		component.cycleFormat();
		fixture.detectChanges();

		expect(component.fieldErrors.hours()).toBeNull();
	});

	// --- Minute validation ---

	it('should accept valid minutes', () => {
		component.updateTime(mockEvent('30'), 'minutes');

		expect(hostComponent.lastEmittedTime?.minutes).toBe('30');
		expect(component.fieldErrors.minutes()).toBeNull();
	});

	it('should emit minutes 60 AND surface the minutes error', () => {
		component.updateTime(mockEvent('60'), 'minutes');

		expect(hostComponent.lastEmittedTime?.minutes).toBe('60');
		expect(component.fieldErrors.minutes()).toBe(MINUTES_RANGE_ERROR);
	});

	it('should emit non-numeric minutes AND surface the invalid-characters error', () => {
		component.updateTime(mockEvent('a5'), 'minutes');

		expect(hostComponent.lastEmittedTime?.minutes).toBe('a5');
		expect(component.fieldErrors.minutes()).toBe(INVALID_CHARS_ERROR);
	});

	// --- Second validation ---

	it('should accept valid seconds', () => {
		component.updateTime(mockEvent('45'), 'seconds');

		expect(hostComponent.lastEmittedTime?.seconds).toBe('45');
		expect(component.fieldErrors.seconds()).toBeNull();
	});

	it('should emit seconds 60 AND surface the seconds error', () => {
		component.updateTime(mockEvent('60'), 'seconds');

		expect(hostComponent.lastEmittedTime?.seconds).toBe('60');
		expect(component.fieldErrors.seconds()).toBe(SECONDS_RANGE_ERROR);
	});

	// --- Empty values clear errors ---

	it('should allow clearing fields and clear errors', () => {
		hostComponent.time = {
			hours: '10',
			minutes: '30',
			seconds: '00',
			format: 'am',
		};
		fixture.detectChanges();
		component.updateTime(mockEvent(''), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('');
		expect(component.fieldErrors.hours()).toBeNull();
	});

	// --- currentError priority ---

	it('should surface hours error first when both hours and minutes are invalid', () => {
		component.updateTime(mockEvent('13'), 'hours');
		component.updateTime(mockEvent('60'), 'minutes');

		expect(component.currentError()).toBe(HOUR_12_RANGE_ERROR);
	});

	// --- Auto-focus ---

	it('should auto-focus the next field after a valid 2-digit hour', () => {
		const focusSpy = spyOn(
			component.minutesInput.nativeElement,
			'focus',
		).and.callThrough();
		component.updateTime(
			mockEvent('10'),
			'hours',
			component.minutesInput.nativeElement,
		);

		expect(focusSpy).toHaveBeenCalled();
	});

	it('should NOT auto-focus the next field when the value is out of range', () => {
		const focusSpy = spyOn(component.minutesInput.nativeElement, 'focus');
		component.updateTime(
			mockEvent('13'),
			'hours',
			component.minutesInput.nativeElement,
		);

		expect(focusSpy).not.toHaveBeenCalled();
	});

	// Dispatches real DOM input events so the template bindings themselves are
	// exercised — a regression test for the minutes -> seconds focus jump.
	it('should auto-focus the seconds input after a valid 2-digit minutes value via the template', () => {
		const [, minutesElement, secondsElement] = Array.from<HTMLInputElement>(
			fixture.nativeElement.querySelectorAll('.pr-time-segment'),
		);
		const focusSpy = spyOn(secondsElement, 'focus');

		minutesElement.value = '30';
		minutesElement.dispatchEvent(new Event('input'));

		expect(focusSpy).toHaveBeenCalled();
	});

	it('should auto-focus the minutes input after a valid 2-digit hour via the template', () => {
		const [hoursElement, minutesElement] = Array.from<HTMLInputElement>(
			fixture.nativeElement.querySelectorAll('.pr-time-segment'),
		);
		const focusSpy = spyOn(minutesElement, 'focus');

		hoursElement.value = '10';
		hoursElement.dispatchEvent(new Event('input'));

		expect(focusSpy).toHaveBeenCalled();
	});

	// --- Format cycle ---

	it('should cycle AM -> PM', () => {
		hostComponent.time = {
			hours: '10',
			minutes: '30',
			seconds: '',
			format: 'am',
		};
		fixture.detectChanges();
		component.cycleFormat();

		expect(hostComponent.lastEmittedTime?.format).toBe('pm');
	});

	it('should cycle PM -> h24', () => {
		hostComponent.time = {
			hours: '10',
			minutes: '30',
			seconds: '',
			format: 'pm',
		};
		fixture.detectChanges();
		component.cycleFormat();

		expect(hostComponent.lastEmittedTime?.format).toBe('h24');
	});

	it('should cycle h24 -> AM', () => {
		hostComponent.time = {
			hours: '14',
			minutes: '30',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();
		component.cycleFormat();

		expect(hostComponent.lastEmittedTime?.format).toBe('am');
	});

	it('should preserve hours value across format cycle', () => {
		hostComponent.time = {
			hours: '10',
			minutes: '30',
			seconds: '',
			format: 'pm',
		};
		fixture.detectChanges();
		component.cycleFormat();

		expect(hostComponent.lastEmittedTime?.hours).toBe('10');
	});

	// --- Format label ---

	it('should expose the AM label by default', () => {
		expect(component.formatLabel()).toBe('AM');
		expect(component.is24Hour()).toBeFalse();
	});

	it('should expose the 24H label when format is h24', () => {
		hostComponent.time = {
			hours: '14',
			minutes: '30',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();

		expect(component.formatLabel()).toBe('24H');
		expect(component.is24Hour()).toBeTrue();
	});

	it('should render formatLabel and bind meridian=false when h24 is active', () => {
		hostComponent.time = {
			hours: '14',
			minutes: '30',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();

		const toggleButton: HTMLButtonElement =
			fixture.nativeElement.querySelector('.pr-am-pm-toggle');

		expect(toggleButton.textContent?.trim()).toBe('24H');

		component.toggleTimepicker();
		fixture.detectChanges();

		const ngbTimepicker = fixture.debugElement.query(
			(node) => node.name === 'ngb-timepicker',
		);

		expect(ngbTimepicker.componentInstance.meridian).toBeFalse();
	});

	// --- Outside click ---

	it('should close timepicker on outside click', () => {
		component.showTimepicker.set(true);
		component.onDocumentClick({
			target: document.body,
		} as unknown as MouseEvent);

		expect(component.showTimepicker()).toBeFalse();
	});

	// --- FormControl sync ---

	it('should sync FormControl from input time (PM)', () => {
		hostComponent.time = {
			hours: '02',
			minutes: '30',
			seconds: '15',
			format: 'pm',
		};
		fixture.detectChanges();

		expect(component.timepickerControl.value).toEqual({
			hour: 14,
			minute: 30,
			second: 15,
		});
	});

	it('should sync FormControl from input time (12 AM = 0)', () => {
		hostComponent.time = {
			hours: '12',
			minutes: '00',
			seconds: '00',
			format: 'am',
		};
		fixture.detectChanges();

		expect(component.timepickerControl.value).toEqual({
			hour: 0,
			minute: 0,
			second: 0,
		});
	});

	it('should sync FormControl from input time (12 PM = 12)', () => {
		hostComponent.time = {
			hours: '12',
			minutes: '00',
			seconds: '00',
			format: 'pm',
		};
		fixture.detectChanges();

		expect(component.timepickerControl.value).toEqual({
			hour: 12,
			minute: 0,
			second: 0,
		});
	});

	it('should set FormControl to midnight for empty time', () => {
		hostComponent.time = {
			hours: '',
			minutes: '',
			seconds: '',
			format: 'am',
		};
		fixture.detectChanges();

		expect(component.timepickerControl.value).toEqual({
			hour: 0,
			minute: 0,
			second: 0,
		});
	});

	it('should sync FormControl from input time (h24)', () => {
		hostComponent.time = {
			hours: '14',
			minutes: '30',
			seconds: '15',
			format: 'h24',
		};
		fixture.detectChanges();

		expect(component.timepickerControl.value).toEqual({
			hour: 14,
			minute: 30,
			second: 15,
		});
	});

	// --- NgbTimepicker selection ---

	it('should emit time on ngb-timepicker select for AM', () => {
		component.onTimeSelect({ hour: 9, minute: 15, second: 30 });

		expect(hostComponent.lastEmittedTime).toEqual({
			hours: '09',
			minutes: '15',
			seconds: '30',
			format: 'am',
		});
	});

	it('should emit time on ngb-timepicker select for PM', () => {
		component.onTimeSelect({ hour: 14, minute: 45, second: 0 });

		expect(hostComponent.lastEmittedTime).toEqual({
			hours: '02',
			minutes: '45',
			seconds: '00',
			format: 'pm',
		});
	});

	it('should emit 12 PM for hour 12', () => {
		component.onTimeSelect({ hour: 12, minute: 0, second: 0 });

		expect(hostComponent.lastEmittedTime?.hours).toBe('12');
		expect(hostComponent.lastEmittedTime?.format).toBe('pm');
	});

	it('should emit 12 AM for hour 0', () => {
		component.onTimeSelect({ hour: 0, minute: 0, second: 0 });

		expect(hostComponent.lastEmittedTime?.hours).toBe('12');
		expect(hostComponent.lastEmittedTime?.format).toBe('am');
	});

	it('should emit raw 24h hour when h24 is active', () => {
		hostComponent.time = {
			hours: '14',
			minutes: '00',
			seconds: '00',
			format: 'h24',
		};
		fixture.detectChanges();
		component.onTimeSelect({ hour: 14, minute: 30, second: 0 });

		expect(hostComponent.lastEmittedTime).toEqual({
			hours: '14',
			minutes: '30',
			seconds: '00',
			format: 'h24',
		});
	});

	it('should not emit on null ngb-timepicker value', () => {
		component.onTimeSelect(null);

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	it('should preserve the timezone offset on ngb-timepicker select', () => {
		hostComponent.time = {
			hours: '09',
			minutes: '15',
			seconds: '30',
			format: 'am',
			timezoneOffset: '+05:30',
		};
		fixture.detectChanges();
		component.onTimeSelect({ hour: 14, minute: 45, second: 0 });

		expect(hostComponent.lastEmittedTime?.timezoneOffset).toBe('+05:30');
	});
	// --- Initial / @Input-driven error sync ---

	it('should surface errors derived from incoming @Input time', () => {
		hostComponent.time = {
			hours: '25',
			minutes: '',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();

		expect(component.fieldErrors.hours()).toBe(HOUR_24_RANGE_ERROR);
	});
});
