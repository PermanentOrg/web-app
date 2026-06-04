import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TimeModel } from '@shared/services/edtf-service/edtf.service';
import { TimepickerInputComponent } from './timepicker-input.component';

@Component({
	template: `<pr-timepicker-input
		[time]="time"
		[disabled]="disabled"
		[showSeconds]="showSeconds"
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
		am: true,
		pm: false,
	};
	disabled = false;
	showSeconds = true;
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

	it('should hide seconds input when showSeconds is false', () => {
		hostComponent.showSeconds = false;
		fixture.detectChanges();
		const inputs = fixture.nativeElement.querySelectorAll('.pr-time-segment');

		expect(inputs.length).toBe(2);
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

	// --- Hour validation ---

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
			am: true,
			pm: false,
		};
		fixture.detectChanges();
		component.updateTime(mockEvent(''), 'hours');

		expect(hostComponent.lastEmittedTime?.hours).toBe('');
	});

	// --- AM/PM toggle ---

	it('should toggle AM to PM', () => {
		hostComponent.time = {
			hours: '10',
			minutes: '30',
			seconds: '',
			am: true,
			pm: false,
		};
		fixture.detectChanges();
		component.toggleAmPm();

		expect(hostComponent.lastEmittedTime?.pm).toBeTrue();
	});

	it('should toggle PM to AM', () => {
		hostComponent.time = {
			hours: '10',
			minutes: '30',
			seconds: '',
			am: false,
			pm: true,
		};
		fixture.detectChanges();
		component.toggleAmPm();

		expect(hostComponent.lastEmittedTime?.am).toBeTrue();
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
			am: false,
			pm: true,
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
			am: true,
			pm: false,
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
			am: false,
			pm: true,
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
			am: true,
			pm: false,
		};
		fixture.detectChanges();

		expect(component.timepickerControl.value).toEqual({
			hour: 0,
			minute: 0,
			second: 0,
		});
	});

	// --- NgbTimepicker selection ---

	it('should emit time on ngb-timepicker select for AM', () => {
		component.onTimeSelect({ hour: 9, minute: 15, second: 30 });

		expect(hostComponent.lastEmittedTime).toEqual({
			hours: '09',
			minutes: '15',
			seconds: '30',
			am: true,
			pm: false,
		});
	});

	it('should emit time on ngb-timepicker select for PM', () => {
		component.onTimeSelect({ hour: 14, minute: 45, second: 0 });

		expect(hostComponent.lastEmittedTime).toEqual({
			hours: '02',
			minutes: '45',
			seconds: '00',
			am: false,
			pm: true,
		});
	});

	it('should emit 12 PM for hour 12', () => {
		component.onTimeSelect({ hour: 12, minute: 0, second: 0 });

		expect(hostComponent.lastEmittedTime?.hours).toBe('12');
		expect(hostComponent.lastEmittedTime?.pm).toBeTrue();
	});

	it('should emit 12 AM for hour 0', () => {
		component.onTimeSelect({ hour: 0, minute: 0, second: 0 });

		expect(hostComponent.lastEmittedTime?.hours).toBe('12');
		expect(hostComponent.lastEmittedTime?.am).toBeTrue();
	});

	it('should not emit on null ngb-timepicker value', () => {
		component.onTimeSelect(null);

		expect(hostComponent.lastEmittedTime).toBeNull();
	});
});
