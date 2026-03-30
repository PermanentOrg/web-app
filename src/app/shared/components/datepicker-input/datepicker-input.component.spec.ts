import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DatepickerInputComponent } from './datepicker-input.component';
import { DateModel } from '@shared/services/edtf-service/edtf.service';

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


	it('should accept valid 4-digit year and emit', () => {
		component.updateYear(mockEvent('2026'));

		expect(hostComponent.lastEmittedDate?.year).toBe('2026');
	});

	it('should not emit for incomplete year', () => {
		component.updateYear(mockEvent('202'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should reject non-numeric year', () => {
		component.updateYear(mockEvent('20ab'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should reject year starting with 0', () => {
		component.updateYear(mockEvent('0123'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should accept valid 2-digit month and emit', () => {
		component.updateMonth(mockEvent('06'));

		expect(hostComponent.lastEmittedDate?.month).toBe('06');
	});

	it('should not emit for single digit month', () => {
		component.updateMonth(mockEvent('6'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should not emit or auto-focus for invalid month', () => {
		component.updateMonth(mockEvent('13'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should reject non-numeric month', () => {
		component.updateMonth(mockEvent('ab'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should accept valid 2-digit day for month and emit', () => {
		hostComponent.date = { year: '2026', month: '01', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('31'));

		expect(hostComponent.lastEmittedDate?.day).toBe('31');
	});

	it('should not emit for single digit day', () => {
		hostComponent.date = { year: '2026', month: '01', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('3'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should not emit day greater than max for month', () => {
		hostComponent.date = { year: '2026', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('30'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should accept day 29 for February in leap year', () => {
		hostComponent.date = { year: '2024', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('29'));

		expect(hostComponent.lastEmittedDate?.day).toBe('29');
	});

	it('should not emit day 29 for February in non-leap year', () => {
		hostComponent.date = { year: '2025', month: '02', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('29'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should not emit day 31 for 30-day months', () => {
		hostComponent.date = { year: '2026', month: '04', day: '' };
		fixture.detectChanges();
		component.updateDay(mockEvent('31'));

		expect(hostComponent.lastEmittedDate).toBeNull();
	});

	it('should allow typing first digit 0 or 1 for month', () => {
		const input = { value: '0' } as HTMLInputElement;
		component.updateMonth({ target: input } as unknown as Event);

		expect(input.value).toBe('0');
	});

	it('should reject first digit > 1 for month', () => {
		hostComponent.date = { year: '', month: '', day: '' };
		fixture.detectChanges();
		const input = { value: '5' } as HTMLInputElement;
		component.updateMonth({ target: input } as unknown as Event);

		expect(input.value).toBe('');
	});

	it('should not emit when clearing year field', () => {
		hostComponent.date = { year: '2026', month: '02', day: '18' };
		fixture.detectChanges();
		component.updateYear(mockEvent(''));

		expect(hostComponent.lastEmittedDate).toBeNull();
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
