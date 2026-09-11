import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
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

	it('should ask for nothing at all when the item is read only', () => {
		component.canEdit = false;
		fixture.detectChanges();
		let edits = 0;
		component.editRequested.subscribe(() => (edits += 1));

		query<HTMLButtonElement>('.sidebar-item-content').click();

		expect(edits).toBe(0);
	});
});
