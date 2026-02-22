import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import {
	DatepickerInputComponent,
	DateInputObject,
} from './datepicker-input.component';

@Component({
	standalone: true,
	imports: [DatepickerInputComponent],
	template: `<pr-datepicker-input
		[date]="date"
		[disabled]="disabled"
		(dateChange)="onDateChange($event)"
	/>`,
})
class TestHostComponent {
	date: DateInputObject = { year: '', month: '', day: '' };
	disabled = false;
	lastEmittedDate: DateInputObject | null = null;

	onDateChange(newDate: DateInputObject): void {
		this.lastEmittedDate = newDate;
		this.date = newDate;
	}
}

describe('DatepickerInputComponent', () => {
	let hostComponent: TestHostComponent;
	let fixture: ComponentFixture<TestHostComponent>;
	let component: DatepickerInputComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		hostComponent = fixture.componentInstance;
		fixture.detectChanges();
		component = fixture.debugElement.children[0].componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	const mockEvent = (value: string): Event =>
		({ target: { value } }) as unknown as Event;

	// --- Year validation ---

	it('should accept valid year', () => {
		component.updateYear(mockEvent('2026'));

		expect(hostComponent.lastEmittedDate?.year).toBe('2026');
	});

	it('should reject non-numeric year', () => {
		component.updateYear(mockEvent('20ab'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should reject year starting with 0', () => {
		component.updateYear(mockEvent('0123'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	// --- Month validation ---

	it('should accept valid month', () => {
		component.updateMonth(mockEvent('06'));

		expect(hostComponent.lastEmittedDate?.month).toBe('06');
	});

	it('should reject month greater than 12', () => {
		component.updateMonth(mockEvent('13'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should reject non-numeric month', () => {
		component.updateMonth(mockEvent('ab'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	// --- Day validation ---

	it('should accept valid day for month', () => {
		hostComponent.date = { year: '2026', month: '01', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('31'));

		expect(hostComponent.lastEmittedDate?.day).toBe('31');
	});

	it('should reject day greater than max for month', () => {
		hostComponent.date = { year: '2026', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('30'));

		expect(hostComponent.lastEmittedDate?.day).toBeUndefined();
	});

	it('should accept day 29 for February in leap year', () => {
		hostComponent.date = { year: '2024', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('29'));

		expect(hostComponent.lastEmittedDate?.day).toBe('29');
	});

	it('should reject day 29 for February in non-leap year', () => {
		hostComponent.date = { year: '2025', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('29'));

		expect(hostComponent.lastEmittedDate?.day).toBeUndefined();
	});

	it('should reject day 31 for 30-day months', () => {
		hostComponent.date = { year: '2026', month: '04', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('31'));

		expect(hostComponent.lastEmittedDate?.day).toBeUndefined();
	});

	// --- Day clamping ---

	it('should clamp day when month changes to shorter month', () => {
		hostComponent.date = { year: '2026', month: '01', day: '31' };
		fixture.detectChanges();
		component.updateMonth(mockEvent('02'));

		expect(hostComponent.lastEmittedDate?.day).toBe('28');
	});

	it('should clamp day when year changes making Feb shorter', () => {
		hostComponent.date = { year: '2024', month: '02', day: '29' };
		fixture.detectChanges();
		component.updateYear(mockEvent('2025'));

		expect(hostComponent.lastEmittedDate?.day).toBe('28');
	});

	// --- Empty values ---

	it('should allow clearing fields', () => {
		hostComponent.date = { year: '2026', month: '02', day: '18' };
		fixture.detectChanges();
		component.updateYear(mockEvent(''));

		expect(hostComponent.lastEmittedDate?.year).toBe('');
	});

	// --- Datepicker ---

	it('should toggle datepicker', () => {
		component.toggleDatepicker();

		expect(component.showDatepicker()).toBeTrue();
		component.toggleDatepicker();

		expect(component.showDatepicker()).toBeFalse();
	});

	it('should not toggle datepicker when disabled', () => {
		hostComponent.disabled = true;
		fixture.detectChanges();
		component.toggleDatepicker();

		expect(component.showDatepicker()).toBeFalse();
	});

	it('should emit date and close datepicker on date select', () => {
		component.showDatepicker.set(true);
		component.onDateSelect({ year: 2026, month: 3, day: 15 });

		expect(hostComponent.lastEmittedDate).toEqual({
			year: '2026',
			month: '03',
			day: '15',
		});

		expect(component.showDatepicker()).toBeFalse();
	});

	it('should return null datepickerModel for incomplete date', () => {
		hostComponent.date = { year: '2026', month: '', day: '' };
		fixture.detectChanges();

		expect(component.datepickerModel()).toBeNull();
	});

	it('should close datepicker on outside click', () => {
		component.showDatepicker.set(true);
		component.onDocumentClick({
			target: document.body,
		} as unknown as MouseEvent);

		expect(component.showDatepicker()).toBeFalse();
	});
});
