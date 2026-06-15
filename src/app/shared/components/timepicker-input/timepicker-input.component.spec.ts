import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TimeModel } from '@shared/services/edtf-service/edtf.service';
import { TimepickerInputComponent } from './timepicker-input.component';

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

	// --- Hour validation (12-hour) ---

	it('should accept valid hour', () => {
		component.updateTime(mockEvent('10'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('10');
	});

	it('should reject hour greater than 12', () => {
		component.updateTime(mockEvent('13'), 'hours');

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	it('should reject non-numeric hour', () => {
		component.updateTime(mockEvent('ab'), 'hours');

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	it('should accept single digit 0 or 1 for hours', () => {
		component.updateTime(mockEvent('1'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('1');
	});

	it('should reject single digit greater than 1 for hours', () => {
		component.updateTime(mockEvent('2'), 'hours');

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	// --- Hour validation (24-hour) ---

	it('should accept hours 00-23 in h24 mode', () => {
		hostComponent.time = {
			hours: '',
			minutes: '',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();

		component.updateTime(mockEvent('00'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('00');

		component.updateTime(mockEvent('13'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('13');

		component.updateTime(mockEvent('23'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('23');
	});

	it('should reject hours 24 and above in h24 mode', () => {
		hostComponent.time = {
			hours: '12',
			minutes: '',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();
		hostComponent.lastEmittedTime = null;

		component.updateTime(mockEvent('24'), 'hours');

		expect(hostComponent.lastEmittedTime).toBeNull();

		component.updateTime(mockEvent('30'), 'hours');

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	it('should accept single digit 0-2 for hours in h24 mode', () => {
		hostComponent.time = {
			hours: '',
			minutes: '',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();

		component.updateTime(mockEvent('2'), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('2');
	});

	it('should reject single digit greater than 2 for hours in h24 mode', () => {
		hostComponent.time = {
			hours: '',
			minutes: '',
			seconds: '',
			format: 'h24',
		};
		fixture.detectChanges();

		component.updateTime(mockEvent('3'), 'hours');

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	// --- Minute validation ---

	it('should accept valid minutes', () => {
		component.updateTime(mockEvent('30'), 'minutes');

		expect(hostComponent.lastEmittedTime?.minutes).toBe('30');
	});

	it('should reject minutes greater than 59', () => {
		component.updateTime(mockEvent('60'), 'minutes');

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	it('should accept single digit 0-5 for minutes', () => {
		component.updateTime(mockEvent('5'), 'minutes');

		expect(hostComponent.lastEmittedTime?.minutes).toBe('5');
	});

	it('should reject single digit greater than 5 for minutes', () => {
		component.updateTime(mockEvent('6'), 'minutes');

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	// --- Second validation ---

	it('should accept valid seconds', () => {
		component.updateTime(mockEvent('45'), 'seconds');

		expect(hostComponent.lastEmittedTime?.seconds).toBe('45');
	});

	it('should reject seconds greater than 59', () => {
		component.updateTime(mockEvent('60'), 'seconds');

		expect(hostComponent.lastEmittedTime).toBeNull();
	});

	// --- Empty values ---

	it('should allow clearing fields', () => {
		hostComponent.time = {
			hours: '10',
			minutes: '30',
			seconds: '00',
			format: 'am',
		};
		fixture.detectChanges();
		component.updateTime(mockEvent(''), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('');
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
});
