import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DateModel } from '@shared/services/edtf-service/edtf.service';
import {
	DatepickerInputComponent,
	DAY_RANGE_ERROR,
	INVALID_CHARS_ERROR,
	MONTH_RANGE_ERROR,
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
	date: DateModel = { year: '', month: '', day: '' };
	disabled = false;
	lastEmittedDate: DateModel | null = null;

	onDateChange(newDate: DateModel): void {
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

	// --- Valid input ---

	it('should accept valid 4-digit year and emit', () => {
		component.updateYear(mockEvent('2026'));

		expect(hostComponent.lastEmittedDate?.year).toBe('2026');
		expect(component.fieldErrors.year()).toBeNull();
	});

	it('should emit incomplete year as raw digits (no X in input)', () => {
		component.updateYear(mockEvent('202'));

		expect(hostComponent.lastEmittedDate?.year).toBe('202');
		expect(component.fieldErrors.year()).toBeNull();
	});

	it('should accept year padded with leading zeros (ISO 8601)', () => {
		component.updateYear(mockEvent('0985'));

		expect(hostComponent.lastEmittedDate?.year).toBe('0985');
	});

	it('should accept valid 2-digit month and emit', () => {
		component.updateMonth(mockEvent('06'));

		expect(hostComponent.lastEmittedDate?.month).toBe('06');
		expect(component.fieldErrors.month()).toBeNull();
	});

	it('should accept single digit month', () => {
		component.updateMonth(mockEvent('1'));

		expect(hostComponent.lastEmittedDate?.month).toBe('1');
		expect(component.fieldErrors.month()).toBeNull();
	});

	it('should accept day 29 for February in leap year', () => {
		hostComponent.date = { year: '2024', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('29'));

		expect(hostComponent.lastEmittedDate?.day).toBe('29');
		expect(component.fieldErrors.day()).toBeNull();
	});

	// --- Invalid input now emits AND surfaces an error ---

	it('should emit invalid characters in the year and surface the invalid-characters error', () => {
		component.updateYear(mockEvent('20ab'));

		expect(hostComponent.lastEmittedDate?.year).toBe('20ab');
		expect(component.fieldErrors.year()).toBe(INVALID_CHARS_ERROR);
		expect(component.currentError()).toBe(INVALID_CHARS_ERROR);
	});

	it('should emit out-of-range month and surface the month error', () => {
		component.updateMonth(mockEvent('13'));

		expect(hostComponent.lastEmittedDate?.month).toBe('13');
		expect(component.fieldErrors.month()).toBe(MONTH_RANGE_ERROR);
	});

	it('should NOT surface the month range error while only one digit has been typed', () => {
		component.updateMonth(mockEvent('5'));

		expect(hostComponent.lastEmittedDate?.month).toBe('5');
		expect(component.fieldErrors.month()).toBeNull();
	});

	it('should NOT surface the day range error while only one digit has been typed', () => {
		hostComponent.date = { year: '2026', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('9'));

		expect(hostComponent.lastEmittedDate?.day).toBe('9');
		expect(component.fieldErrors.day()).toBeNull();
	});

	it('should emit invalid characters in the month and surface the invalid-characters error', () => {
		component.updateMonth(mockEvent('ab'));

		expect(hostComponent.lastEmittedDate?.month).toBe('ab');
		expect(component.fieldErrors.month()).toBe(INVALID_CHARS_ERROR);
	});

	it('should emit day 31 in April and surface the day error', () => {
		hostComponent.date = { year: '2026', month: '04', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('31'));

		expect(hostComponent.lastEmittedDate?.day).toBe('31');
		expect(component.fieldErrors.day()).toBe(DAY_RANGE_ERROR);
	});

	it('should emit day 30 in February and surface the day error', () => {
		hostComponent.date = { year: '2026', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('30'));

		expect(hostComponent.lastEmittedDate?.day).toBe('30');
		expect(component.fieldErrors.day()).toBe(DAY_RANGE_ERROR);
	});

	it('should emit day 29 in February of a non-leap year and surface the day error', () => {
		hostComponent.date = { year: '2025', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('29'));

		expect(hostComponent.lastEmittedDate?.day).toBe('29');
		expect(component.fieldErrors.day()).toBe(DAY_RANGE_ERROR);
	});

	it('should re-validate the day when the month changes', () => {
		hostComponent.date = { year: '2026', month: '01', day: '31' };
		fixture.detectChanges();

		expect(component.fieldErrors.day()).toBeNull();

		component.updateMonth(mockEvent('04'));

		expect(component.fieldErrors.day()).toBe(DAY_RANGE_ERROR);
	});

	it('should clear the year error when the field is cleared', () => {
		component.updateYear(mockEvent('20ab'));

		expect(component.fieldErrors.year()).not.toBeNull();

		component.updateYear(mockEvent(''));

		expect(component.fieldErrors.year()).toBeNull();
	});

	// --- Auto-focus behavior ---

	it('should auto-focus the month input after a valid 4-digit year', () => {
		const focusSpy = spyOn(
			component.monthInput.nativeElement,
			'focus',
		).and.callThrough();
		component.updateYear(mockEvent('2026'));

		expect(focusSpy).toHaveBeenCalled();
	});

	it('should NOT auto-focus the month input when the year has invalid characters', () => {
		const focusSpy = spyOn(component.monthInput.nativeElement, 'focus');
		component.updateYear(mockEvent('20ab'));

		expect(focusSpy).not.toHaveBeenCalled();
	});

	it('should auto-focus the day input after a valid 2-digit month', () => {
		const focusSpy = spyOn(
			component.dayInput.nativeElement,
			'focus',
		).and.callThrough();
		component.updateMonth(mockEvent('06'));

		expect(focusSpy).toHaveBeenCalled();
	});

	it('should NOT auto-focus the day input when the month is out of range', () => {
		const focusSpy = spyOn(component.dayInput.nativeElement, 'focus');
		component.updateMonth(mockEvent('13'));

		expect(focusSpy).not.toHaveBeenCalled();
	});

	// --- Misc ---

	it('should emit when clearing the year field', () => {
		hostComponent.date = { year: '2026', month: '02', day: '18' };
		fixture.detectChanges();
		component.updateYear(mockEvent(''));

		expect(hostComponent.lastEmittedDate).toBeTruthy();
		expect(hostComponent.lastEmittedDate.year).toBe('');
	});

	it('should emit intermediate digits as the user types the year', () => {
		component.updateYear(mockEvent('19'));

		expect(hostComponent.lastEmittedDate?.year).toBe('19');
	});

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

	it('should emit date and clear errors on date select', () => {
		component.showDatepicker.set(true);
		component.fieldErrors.month.set(MONTH_RANGE_ERROR);
		component.onDateSelect({ year: 2026, month: 3, day: 15 });

		expect(hostComponent.lastEmittedDate).toEqual({
			year: '2026',
			month: '03',
			day: '15',
		});

		expect(component.showDatepicker()).toBeFalse();
		expect(component.currentError()).toBeNull();
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

	it('should refresh errors from incoming @Input date on changes', () => {
		hostComponent.date = { year: '2026', month: '13', day: '' };
		fixture.detectChanges();

		expect(component.fieldErrors.month()).toBe(MONTH_RANGE_ERROR);
	});
});
