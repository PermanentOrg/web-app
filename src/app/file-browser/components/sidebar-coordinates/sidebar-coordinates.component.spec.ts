import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocnVOData } from '@models';
import { Coordinates } from '@shared/utilities/coordinates';
import { SidebarCoordinatesComponent } from './sidebar-coordinates.component';

const LISBON = { latitude: 38.70786, longitude: -9.400139 };
const LISBON_AS_SHOWN = `38°42'28.3" N  9°24'00.5" W`;

describe('SidebarCoordinatesComponent', () => {
	let fixture: ComponentFixture<SidebarCoordinatesComponent>;
	let changes: Array<Coordinates | null>;
	let mapRequests: number;

	const render = (location: LocnVOData | null, canEdit: boolean): void => {
		fixture.componentRef.setInput('location', location);
		fixture.componentRef.setInput('canEdit', canEdit);
		fixture.detectChanges();
	};

	const query = <T extends HTMLElement>(selector: string): T =>
		fixture.nativeElement.querySelector(selector);

	const click = (selector: string): void => {
		query<HTMLButtonElement>(selector).click();
		fixture.detectChanges();
	};

	const type = (text: string): void => {
		const input = query<HTMLInputElement>('.pr-sidebar-coordinates-input');
		input.value = text;
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();
	};

	const pressEnter = (): void => {
		query<HTMLFormElement>('.pr-sidebar-coordinates-editor').requestSubmit();
		fixture.detectChanges();
	};

	const pressEscape = (): void => {
		query('.pr-sidebar-coordinates-input').dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
		);
		fixture.detectChanges();
	};

	const isEditing = (): boolean =>
		query('.pr-sidebar-coordinates-editor') !== null;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SidebarCoordinatesComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(SidebarCoordinatesComponent);
		changes = [];
		mapRequests = 0;
		fixture.componentInstance.coordinatesChange.subscribe((coordinates) =>
			changes.push(coordinates),
		);
		fixture.componentInstance.mapRequested.subscribe(() => (mapRequests += 1));
	});

	describe('when the location has coordinates', () => {
		it('should show them in degrees, minutes and seconds', () => {
			render({ ...LISBON }, true);

			expect(query('.pr-sidebar-coordinates-value').textContent.trim()).toBe(
				LISBON_AS_SHOWN,
			);
		});

		it('should read coordinates stored as text', () => {
			render({ latitude: '38.70786', longitude: '-9.400139' }, true);

			expect(query('.pr-sidebar-coordinates-value')).not.toBeNull();
		});

		it('should give the edit button a name a screen reader can announce', () => {
			render({ ...LISBON }, true);

			expect(
				query('.pr-sidebar-coordinates-edit').getAttribute('aria-label'),
			).toBe('Edit coordinates');
		});

		it('should start editing from what is shown', () => {
			render({ ...LISBON }, true);

			click('.pr-sidebar-coordinates-edit');

			expect(
				query<HTMLInputElement>('.pr-sidebar-coordinates-input').value,
			).toBe(LISBON_AS_SHOWN);
		});

		it('should still show them to someone who cannot edit', () => {
			render({ ...LISBON }, false);

			expect(query('.pr-sidebar-coordinates-value')).not.toBeNull();
			expect(query('.pr-sidebar-coordinates-edit')).toBeNull();
		});
	});

	describe('when the location has no coordinates', () => {
		it('should invite an editor to add some', () => {
			render({ city: 'Lisbon' }, true);

			expect(query('.pr-sidebar-coordinates-add').textContent.trim()).toBe(
				'Add coordinates…',
			);
		});

		it('should invite an editor to add some to an item with no location', () => {
			render(null, true);

			expect(query('.pr-sidebar-coordinates-add')).not.toBeNull();
		});

		it('should start editing from an empty field', () => {
			render(null, true);

			click('.pr-sidebar-coordinates-add');

			expect(
				query<HTMLInputElement>('.pr-sidebar-coordinates-input').value,
			).toBe('');
		});

		it('should show nothing to someone who cannot add any', () => {
			render({ city: 'Lisbon' }, false);

			expect(fixture.nativeElement.textContent.trim()).toBe('');
		});
	});

	describe('while editing', () => {
		beforeEach(() => {
			render(null, true);
			click('.pr-sidebar-coordinates-add');
		});

		it('should put the cursor in the field', () => {
			expect(document.activeElement).toBe(
				query('.pr-sidebar-coordinates-input'),
			);
		});

		it('should save coordinates it can read', () => {
			type('38.70786, -9.400139');
			pressEnter();

			expect(changes).toEqual([LISBON]);
			expect(isEditing()).toBeFalse();
		});

		it('should save from the submit button', () => {
			type('38.70786, -9.400139');
			click('.pr-sidebar-coordinates-submit');

			expect(changes).toEqual([LISBON]);
		});

		it('should refuse text it cannot read', () => {
			type('somewhere nice');

			expect(
				query<HTMLButtonElement>('.pr-sidebar-coordinates-submit').disabled,
			).toBeTrue();

			expect(
				query('.pr-sidebar-coordinates-editor').classList.contains('invalid'),
			).toBeTrue();

			pressEnter();

			expect(changes).toEqual([]);
			expect(isEditing()).toBeTrue();
		});

		it('should save nothing when cancelled', () => {
			type('38.70786, -9.400139');
			click('.pr-sidebar-coordinates-cancel');

			expect(changes).toEqual([]);
			expect(isEditing()).toBeFalse();
		});

		it('should save nothing when escaped', () => {
			type('38.70786, -9.400139');
			pressEscape();

			expect(changes).toEqual([]);
			expect(isEditing()).toBeFalse();
		});

		it('should save nothing when left empty', () => {
			pressEnter();

			expect(changes).toEqual([]);
			expect(isEditing()).toBeFalse();
		});

		it('should hand off to the map and stop editing', () => {
			click('.pr-sidebar-coordinates-map');

			expect(mapRequests).toBe(1);
			expect(isEditing()).toBeFalse();
		});
	});

	describe('while editing existing coordinates', () => {
		beforeEach(() => {
			render({ ...LISBON }, true);
			click('.pr-sidebar-coordinates-edit');
		});

		it('should save nothing when they are left as shown', () => {
			pressEnter();

			expect(changes).toEqual([]);
			expect(isEditing()).toBeFalse();
		});

		it('should clear them when the field is emptied', () => {
			type('');
			pressEnter();

			expect(changes).toEqual([null]);
		});
	});
});
