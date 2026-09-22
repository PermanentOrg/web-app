import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
import { Coordinates } from '@shared/utilities/coordinates';
import { SidebarLocationComponent } from './sidebar-location.component';

describe('SidebarLocationComponent', () => {
	let component: SidebarLocationComponent;
	let fixture: ComponentFixture<SidebarLocationComponent>;

	const query = <T extends HTMLElement>(selector: string): T =>
		fixture.nativeElement.querySelector(selector);

	const queryAll = <T extends HTMLElement>(selector: string): T[] =>
		Array.from(fixture.nativeElement.querySelectorAll(selector));

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SidebarLocationComponent, SharedModule],
		}).compileComponents();

		fixture = TestBed.createComponent(SidebarLocationComponent);
		component = fixture.componentInstance;
		component.canEdit = true;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should invite an editor to set a location it does not have', () => {
		expect(query('.sidebar-item-content-empty').textContent.trim()).toBe(
			'Click to set location',
		);
	});

	it('should say a location is missing to someone who cannot set one', () => {
		component.canEdit = false;
		fixture.detectChanges();

		expect(query('.sidebar-item-content-empty').textContent.trim()).toBe(
			'No location',
		);
	});

	it('should show the address it was given', () => {
		component.location = { city: 'Lisbon', country: 'Portugal' };
		fixture.detectChanges();

		expect(query('.sidebar-item-content').textContent).toContain('Lisbon');
	});

	it('should show a named place on its own line', () => {
		component.location = { name: "Grandma's house", city: 'Lisbon' };
		fixture.detectChanges();

		expect(query('.sidebar-item-content strong').textContent.trim()).toBe(
			"Grandma's house",
		);
	});

	it('should ask for an edit when the address is clicked', () => {
		let edits = 0;
		component.editRequested.subscribe(() => (edits += 1));

		query('.sidebar-item-content').click();

		expect(edits).toBe(1);
	});

	it('should ask for an edit when the map preview is clicked', () => {
		let edits = 0;
		component.editRequested.subscribe(() => (edits += 1));

		queryAll<HTMLButtonElement>('.sidebar-item-content')[1].click();

		expect(edits).toBe(1);
	});

	it('should offer an editor buttons the keyboard can reach', () => {
		const buttons = queryAll<HTMLButtonElement>('button.sidebar-item-content');

		expect(buttons.length).toBe(2);
		expect(buttons.every((button) => !button.disabled)).toBeTrue();
	});

	it('should give the map preview a name a screen reader can announce', () => {
		const mapButton = queryAll<HTMLButtonElement>(
			'button.sidebar-item-content',
		)[1];

		expect(mapButton.getAttribute('aria-label')).toBe('Edit location');
	});

	it('should take the location out of reach when the item is read only', () => {
		component.canEdit = false;
		fixture.detectChanges();

		const buttons = queryAll<HTMLButtonElement>('button.sidebar-item-content');

		expect(buttons.every((button) => button.disabled)).toBeTrue();
	});

	it('should leave coordinates out of the original location display', () => {
		expect(query('pr-sidebar-coordinates')).toBeNull();
	});

	it('should show coordinates when showing uncertain locations', () => {
		fixture.componentRef.setInput('showUncertainLocations', true);
		fixture.detectChanges();

		expect(query('pr-sidebar-coordinates')).not.toBeNull();
	});

	it('should leave out the original address and map when showing uncertain locations', () => {
		fixture.componentRef.setInput('location', { city: 'Lisbon' });
		fixture.componentRef.setInput('showUncertainLocations', true);
		fixture.detectChanges();

		expect(query('.sidebar-location-button')).toBeNull();
		expect(query('pr-static-map')).toBeNull();
	});

	describe('when showing uncertain locations', () => {
		beforeEach(() => {
			fixture.componentRef.setInput('showUncertainLocations', true);
			fixture.detectChanges();
			query<HTMLButtonElement>('.pr-sidebar-coordinates-add').click();
			fixture.detectChanges();
		});

		it('should pass on coordinates typed into the sidebar', () => {
			const changes: Array<Coordinates | null> = [];
			component.coordinatesChange.subscribe((coordinates) =>
				changes.push(coordinates),
			);
			const input = query<HTMLInputElement>('.pr-sidebar-coordinates-input');
			input.value = '38.70786, -9.400139';
			input.dispatchEvent(new Event('input'));
			fixture.detectChanges();

			query<HTMLButtonElement>('.pr-sidebar-coordinates-submit').click();

			expect(changes).toEqual([{ latitude: 38.70786, longitude: -9.400139 }]);
		});

		it('should pass on a request to choose on the map', () => {
			let mapRequests = 0;
			component.coordinatesMapRequested.subscribe(() => (mapRequests += 1));

			query<HTMLButtonElement>('.pr-sidebar-coordinates-map').click();

			expect(mapRequests).toBe(1);
		});
	});

	it('should ask for nothing at all when the item is read only', () => {
		component.canEdit = false;
		fixture.detectChanges();
		let edits = 0;
		component.editRequested.subscribe(() => (edits += 1));

		query<HTMLButtonElement>('.sidebar-item-content').click();

		expect(edits).toBe(0);
	});
});
