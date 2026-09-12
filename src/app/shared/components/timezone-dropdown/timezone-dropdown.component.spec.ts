import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	TIMEZONE_PLACEHOLDER,
	TimezoneDropdownComponent,
} from './timezone-dropdown.component';

describe('TimezoneDropdownComponent', () => {
	let fixture: ComponentFixture<TimezoneDropdownComponent>;
	let instance: TimezoneDropdownComponent;
	let element: HTMLElement;

	const setInput = (name: string, value: unknown): void => {
		fixture.componentRef.setInput(name, value);
		fixture.detectChanges();
	};

	const trigger = (): HTMLButtonElement =>
		element.querySelector('.pr-timezone-trigger');

	const listbox = (): HTMLElement => element.querySelector('[role="listbox"]');

	const options = (): HTMLElement[] =>
		Array.from(element.querySelectorAll('[role="option"]'));

	const pressKey = (target: HTMLElement, key: string): void => {
		target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
		fixture.detectChanges();
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TimezoneDropdownComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TimezoneDropdownComponent);
		instance = fixture.componentInstance;
		element = fixture.nativeElement;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(instance).toBeTruthy();
	});

	describe('selected value', () => {
		it('should show the placeholder when nothing is selected', () => {
			expect(trigger().textContent).toContain(TIMEZONE_PLACEHOLDER);
		});

		it('should show the offset and the tz identifier for a valid identifier', () => {
			setInput('selectedTimezone', 'Europe/Bucharest');

			expect(
				element.querySelector('.pr-timezone-offset').textContent.trim(),
			).toMatch(/^GMT[+-]\d{2}:\d{2}$/);

			expect(
				element.querySelector('.pr-timezone-label').textContent.trim(),
			).toEqual('Europe/Bucharest');
		});

		it('should canonicalize the identifier it displays', () => {
			setInput('selectedTimezone', '  europe/berlin  ');

			expect(
				element.querySelector('.pr-timezone-label').textContent.trim(),
			).toEqual('Europe/Berlin');
		});

		it('should fall back to the placeholder for unusable values', () => {
			[null, undefined, '', 'Not/AZone', 123, {}].forEach((value) => {
				setInput('selectedTimezone', value);

				expect(trigger().textContent).toContain(TIMEZONE_PLACEHOLDER);
			});
		});

		it('should render an identifier that is missing from the supported list', () => {
			setInput('selectedTimezone', 'UTC');

			expect(trigger().textContent).toContain('GMT+00:00');
		});

		it('should make an unlisted selection available in the list', () => {
			setInput('selectedTimezone', 'UTC');
			trigger().click();
			fixture.detectChanges();

			expect(
				instance.visibleOptions().some((option) => option.timezoneId === 'UTC'),
			).toBeTrue();
		});
	});

	describe('accessibility', () => {
		it('should mark the trigger as the combobox when there is no search field', () => {
			expect(trigger().getAttribute('role')).toEqual('combobox');
			expect(trigger().getAttribute('aria-expanded')).toEqual('false');
			expect(trigger().getAttribute('aria-haspopup')).toEqual('listbox');
		});

		it('should point the trigger at the listbox once open', () => {
			trigger().click();
			fixture.detectChanges();

			expect(trigger().getAttribute('aria-expanded')).toEqual('true');
			expect(trigger().getAttribute('aria-controls')).toEqual(
				listbox().getAttribute('id'),
			);
		});

		it('should hand the combobox role to the search field when one is shown', () => {
			setInput('showSearch', true);
			trigger().click();
			fixture.detectChanges();
			const searchInput = element.querySelector('.pr-timezone-search');

			expect(trigger().getAttribute('role')).toBeNull();
			expect(searchInput.getAttribute('role')).toEqual('combobox');
			expect(searchInput.getAttribute('aria-controls')).toEqual(
				listbox().getAttribute('id'),
			);
		});

		it('should move focus to the search field once the panel has rendered', () => {
			setInput('showSearch', true);
			trigger().click();
			fixture.detectChanges();

			expect(document.activeElement).toBe(
				element.querySelector('.pr-timezone-search'),
			);
		});

		it('should group the options by region', () => {
			trigger().click();
			fixture.detectChanges();
			const groups = element.querySelectorAll('[role="group"]');

			expect(groups.length).toBeGreaterThan(1);
			groups.forEach((group) => {
				const labelId = group.getAttribute('aria-labelledby');

				expect(element.querySelector(`#${labelId}`)).toBeTruthy();
			});
		});

		it('should label each option with its tz identifier', () => {
			setInput('showSearch', true);
			trigger().click();
			fixture.detectChanges();
			instance.onSearchTermChange('bucharest');
			fixture.detectChanges();

			expect(
				options()[0]
					.querySelector('.pr-timezone-option-label')
					.textContent.trim(),
			).toEqual('Europe/Bucharest');
		});

		it('should show the country beside the identifier', () => {
			setInput('showSearch', true);
			trigger().click();
			fixture.detectChanges();
			instance.onSearchTermChange('accra');
			fixture.detectChanges();

			expect(
				options()[0]
					.querySelector('.pr-timezone-option-country')
					.textContent.trim(),
			).toEqual('Ghana');
		});

		it('should find a zone by its country name', () => {
			setInput('showSearch', true);
			trigger().click();
			fixture.detectChanges();
			instance.onSearchTermChange('romania');
			fixture.detectChanges();

			expect(
				instance.visibleOptions().map((option) => option.timezoneId),
			).toContain('Europe/Bucharest');
		});

		it('should keep the options out of the tab order', () => {
			trigger().click();
			fixture.detectChanges();

			expect(
				options().every((option) => option.getAttribute('tabindex') === '-1'),
			).toBeTrue();
		});

		it('should mark only the selected option as selected', () => {
			setInput('selectedTimezone', 'Europe/Bucharest');
			trigger().click();
			fixture.detectChanges();
			const selected = options().filter(
				(option) => option.getAttribute('aria-selected') === 'true',
			);

			expect(selected.length).toEqual(1);
		});

		it('should track the active option with aria-activedescendant', () => {
			trigger().click();
			fixture.detectChanges();
			pressKey(trigger(), 'ArrowDown');
			const activeDescendantId = trigger().getAttribute(
				'aria-activedescendant',
			);

			expect(activeDescendantId).toBeTruthy();
			expect(element.querySelector(`#${activeDescendantId}`)).toBeTruthy();
		});
	});

	describe('keyboard interaction', () => {
		it('should open on ArrowDown and ArrowUp', () => {
			pressKey(trigger(), 'ArrowDown');

			expect(instance.isOpen()).toBeTrue();

			instance.close();
			fixture.detectChanges();
			pressKey(trigger(), 'ArrowUp');

			expect(instance.isOpen()).toBeTrue();
		});

		it('should move the active option with the arrow keys', () => {
			trigger().click();
			fixture.detectChanges();
			const firstActive = instance.activeOption();
			pressKey(trigger(), 'ArrowDown');
			const secondActive = instance.activeOption();

			expect(secondActive).not.toBe(firstActive);

			pressKey(trigger(), 'ArrowUp');

			expect(instance.activeOption()).toBe(firstActive);
		});

		it('should jump to the first and last option with Home and End', () => {
			trigger().click();
			fixture.detectChanges();
			pressKey(trigger(), 'End');

			expect(instance.activeOption()).toBe(
				instance.visibleOptions()[instance.visibleOptions().length - 1],
			);

			pressKey(trigger(), 'Home');

			expect(instance.activeOption()).toBe(instance.visibleOptions()[0]);
		});

		it('should emit the identifier of the active option on Enter', () => {
			const emitted: string[] = [];
			instance.timezoneChange.subscribe((value) => emitted.push(value));
			trigger().click();
			fixture.detectChanges();
			pressKey(trigger(), 'ArrowDown');
			const activeTimezoneId = instance.activeOption().timezoneId;
			pressKey(trigger(), 'Enter');

			expect(emitted).toEqual([activeTimezoneId]);
			expect(instance.isOpen()).toBeFalse();
		});

		it('should close and return focus to the trigger on Escape', () => {
			trigger().click();
			fixture.detectChanges();
			pressKey(trigger(), 'Escape');

			expect(instance.isOpen()).toBeFalse();
			expect(document.activeElement).toBe(trigger());
		});

		it('should close on Tab without swallowing the key', () => {
			trigger().click();
			fixture.detectChanges();
			pressKey(trigger(), 'Tab');

			expect(instance.isOpen()).toBeFalse();
		});
	});

	describe('empty state', () => {
		it('should offer a clear row labelled with the placeholder', () => {
			trigger().click();
			fixture.detectChanges();

			expect(
				options()[0]
					.querySelector('.pr-timezone-option-placeholder')
					.textContent.trim(),
			).toEqual(TIMEZONE_PLACEHOLDER);
		});

		it('should emit null when the clear row is chosen', () => {
			const emitted: (string | null)[] = [];
			instance.timezoneChange.subscribe((value) => emitted.push(value));
			setInput('selectedTimezone', 'Europe/Bucharest');
			trigger().click();
			fixture.detectChanges();
			options()[0].click();
			fixture.detectChanges();

			expect(emitted).toEqual([null]);
		});

		it('should mark the clear row as selected while nothing is chosen', () => {
			trigger().click();
			fixture.detectChanges();

			expect(options()[0].getAttribute('aria-selected')).toEqual('true');
		});

		it('should mark the clear row unselected once a zone is chosen', () => {
			setInput('selectedTimezone', 'Europe/Bucharest');
			trigger().click();
			fixture.detectChanges();

			expect(options()[0].getAttribute('aria-selected')).toEqual('false');
		});

		it('should hide the clear row while searching so arrows land on a match', () => {
			setInput('showSearch', true);
			trigger().click();
			fixture.detectChanges();
			instance.onSearchTermChange('bucharest');
			fixture.detectChanges();

			expect(instance.visibleOptions()[0].timezoneId).toEqual(
				'Europe/Bucharest',
			);

			expect(element.querySelector('.pr-timezone-option-clear')).toBeNull();
		});

		it('should clear via the keyboard', () => {
			const emitted: (string | null)[] = [];
			instance.timezoneChange.subscribe((value) => emitted.push(value));
			setInput('selectedTimezone', 'Europe/Bucharest');
			trigger().click();
			fixture.detectChanges();
			pressKey(trigger(), 'Home');
			pressKey(trigger(), 'Enter');

			expect(emitted).toEqual([null]);
		});
	});

	describe('selection', () => {
		it('should emit the identifier when an option is clicked', () => {
			const emitted: (string | null)[] = [];
			instance.timezoneChange.subscribe((value) => emitted.push(value));
			trigger().click();
			fixture.detectChanges();
			// Index 0 is the clear row, so the first real zone sits after it.
			const firstTimezoneId = instance.visibleOptions()[1].timezoneId;
			options()[1].click();
			fixture.detectChanges();

			expect(emitted).toEqual([firstTimezoneId]);
			expect(instance.isOpen()).toBeFalse();
		});

		it('should not open while disabled', () => {
			setInput('disabled', true);
			trigger().click();
			pressKey(trigger(), 'ArrowDown');

			expect(instance.isOpen()).toBeFalse();
		});
	});

	describe('search', () => {
		beforeEach(() => {
			setInput('showSearch', true);
			trigger().click();
			fixture.detectChanges();
		});

		it('should filter the options by city, region and offset', () => {
			instance.onSearchTermChange('bucharest');
			fixture.detectChanges();

			expect(instance.visibleOptions().length).toEqual(1);
			expect(instance.visibleOptions()[0].timezoneId).toEqual(
				'Europe/Bucharest',
			);
		});

		it('should show a message when nothing matches', () => {
			instance.onSearchTermChange('nowhere at all');
			fixture.detectChanges();

			expect(instance.visibleOptions().length).toEqual(0);
			expect(element.querySelector('.pr-timezone-empty')).toBeTruthy();
		});

		it('should reset the active option when the term changes', () => {
			pressKey(trigger(), 'End');
			instance.onSearchTermChange('europe');
			fixture.detectChanges();

			expect(instance.activeOptionIndex()).toEqual(0);
		});

		it('should let a space reach the search field', () => {
			const emitted: string[] = [];
			instance.timezoneChange.subscribe((value) => emitted.push(value));
			pressKey(element.querySelector('.pr-timezone-search'), ' ');

			expect(emitted).toEqual([]);
			expect(instance.isOpen()).toBeTrue();
		});
	});
});
