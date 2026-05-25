import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimezoneService } from '@shared/services/timezone-service/timezone.service';
import { TimezoneDropdownComponent } from './timezone-dropdown.component';

describe('TimezoneDropdownComponent', () => {
	let component: TimezoneDropdownComponent;
	let fixture: ComponentFixture<TimezoneDropdownComponent>;
	let timezoneService: TimezoneService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TimezoneDropdownComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TimezoneDropdownComponent);
		component = fixture.componentInstance;
		timezoneService = TestBed.inject(TimezoneService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
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
		component.filter.set('america');
		component.toggle();

		expect(component.filter()).toBe('');
	});

	it('should reset filter when closing', () => {
		component.toggle();
		component.filter.set('america');
		component.close();

		expect(component.filter()).toBe('');
	});

	// --- Filtering ---

	it('should return all timezones when filter is empty', () => {
		component.filter.set('');

		expect(component.filteredTimezones().length).toBe(component.zones().length);
	});

	it('should filter timezones by IANA name', () => {
		component.filter.set('new_york');
		const filtered = component.filteredTimezones();

		expect(filtered.length).toBeGreaterThan(0);
		expect(
			filtered.every((tz) => tz.ianaZone.toLowerCase().includes('new_york')),
		).toBeTrue();
	});

	it('should filter timezones by label', () => {
		component.filter.set('berlin');
		const filtered = component.filteredTimezones();

		expect(filtered.length).toBeGreaterThan(0);
		expect(
			filtered.every((tz) => tz.label.toLowerCase().includes('berlin')),
		).toBeTrue();
	});

	it('should filter timezones by offset', () => {
		component.filter.set('GMT+09:00');
		const filtered = component.filteredTimezones();

		expect(filtered.length).toBeGreaterThan(0);
		expect(filtered.every((tz) => tz.offset.includes('GMT+09:00'))).toBeTrue();
	});

	it('should filter timezones by abbreviation', () => {
		// EST is what Chromium reliably returns for America/New_York in January.
		component.referenceDate = new Date(Date.UTC(2025, 0, 15));
		fixture.detectChanges();
		component.filter.set('est');
		const filtered = component.filteredTimezones();

		expect(filtered.length).toBeGreaterThan(0);
		expect(
			filtered.some((tz) => tz.ianaZone === 'America/New_York'),
		).toBeTrue();
	});

	// --- Reference date / DST sensitivity ---

	it('should recompute offsets when referenceDate changes', () => {
		const summerDate = new Date(Date.UTC(2025, 6, 15));
		const winterDate = new Date(Date.UTC(2025, 0, 15));

		component.referenceDate = summerDate;
		fixture.detectChanges();
		const summerEntry = component
			.zones()
			.find((tz) => tz.ianaZone === 'America/New_York');

		component.referenceDate = winterDate;
		fixture.detectChanges();
		const winterEntry = component
			.zones()
			.find((tz) => tz.ianaZone === 'America/New_York');

		expect(summerEntry?.offset).toBe('GMT-04:00');
		expect(winterEntry?.offset).toBe('GMT-05:00');
	});

	it('should expose a selectedOption derived from selectedZone and referenceDate', () => {
		fixture.componentRef.setInput('selectedZone', 'America/New_York');
		component.referenceDate = new Date(Date.UTC(2025, 0, 15));
		fixture.detectChanges();

		const selected = component.selectedOption();

		expect(selected?.ianaZone).toBe('America/New_York');
		expect(selected?.offset).toBe('GMT-05:00');
		expect(selected?.abbreviation).toBe('EST');
	});

	it('should return null selectedOption when no zone is selected', () => {
		expect(component.selectedOption()).toBeNull();
	});

	// --- Selection ---

	it('should emit timezoneChange and close on select', () => {
		spyOn(component.timezoneChange, 'emit');
		component.toggle();

		const tz = {
			ianaZone: 'America/New_York',
			offset: 'GMT-05:00',
			label: 'America / New York',
			abbreviation: 'EST',
		};
		component.select(tz);

		expect(component.timezoneChange.emit).toHaveBeenCalledWith(tz);
		expect(component.isOpen()).toBeFalse();
		expect(component.filter()).toBe('');
	});

	it('should emit empty timezone on clearSelection', () => {
		spyOn(component.timezoneChange, 'emit');
		component.clearSelection();

		expect(component.timezoneChange.emit).toHaveBeenCalledWith({
			ianaZone: '',
			offset: '',
			label: '',
			abbreviation: '',
		});
	});

	// Reference to timezoneService to ensure DI works
	it('should inject TimezoneService', () => {
		expect(timezoneService).toBeTruthy();
	});
});
