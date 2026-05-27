import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	TimezoneDropdownComponent,
	TimezoneOption,
} from './timezone-dropdown.component';

describe('TimezoneDropdownComponent', () => {
	let component: TimezoneDropdownComponent;
	let fixture: ComponentFixture<TimezoneDropdownComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TimezoneDropdownComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TimezoneDropdownComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should source timezones from the IANA browser list', () => {
		expect(component.timezones.length).toBeGreaterThan(0);
		expect(
			component.timezones.every((tz) => typeof tz.ianaZone === 'string'),
		).toBeTrue();
	});

	// --- Toggle behaviour ---

	it('should open dropdown on toggle', () => {
		expect(component.isOpen()).toBeFalse();
		component.toggle();

		expect(component.isOpen()).toBeTrue();
	});

	it('should close dropdown on second toggle', () => {
		component.toggle();
		component.toggle();

		expect(component.isOpen()).toBeFalse();
	});

	it('should not open when disabled', () => {
		fixture.componentRef.setInput('disabled', true);
		fixture.detectChanges();
		component.toggle();

		expect(component.isOpen()).toBeFalse();
	});

	it('should reset filter when opening', () => {
		component.filter.set('pacific');
		component.toggle();

		expect(component.filter()).toBe('');
	});

	it('should reset filter when closing', () => {
		component.toggle();
		component.filter.set('pacific');
		component.close();

		expect(component.filter()).toBe('');
	});

	// --- Filtering ---

	it('should return all timezones when filter is empty', () => {
		component.filter.set('');

		expect(component.filteredTimezones().length).toBe(
			component.timezones.length,
		);
	});

	it('should filter timezones by IANA name', () => {
		component.filter.set('pacific');
		const filtered = component.filteredTimezones();

		expect(filtered.length).toBeGreaterThan(0);
		expect(
			filtered.every(
				(tz) =>
					tz.ianaZone.toLowerCase().includes('pacific') ||
					tz.label.toLowerCase().includes('pacific') ||
					tz.abbreviation.toLowerCase().includes('pacific'),
			),
		).toBeTrue();
	});

	it('should filter timezones by offset', () => {
		component.filter.set('gmt+09');
		const filtered = component.filteredTimezones();

		expect(filtered.length).toBeGreaterThan(0);
		expect(
			filtered.every((tz) => tz.offset.toLowerCase().includes('gmt+09')),
		).toBeTrue();
	});

	// --- Selection ---

	it('should emit timezoneChange and close on select', () => {
		spyOn(component.timezoneChange, 'emit');
		component.toggle();

		const tz: TimezoneOption = component.timezones[0];
		component.select(tz);

		expect(component.timezoneChange.emit).toHaveBeenCalledWith(tz);
		expect(component.isOpen()).toBeFalse();
		expect(component.filter()).toBe('');
	});

	it('should emit null for placeholder selection', () => {
		spyOn(component.timezoneChange, 'emit');
		component.select(null);

		expect(component.timezoneChange.emit).toHaveBeenCalledWith(null);
	});
});
