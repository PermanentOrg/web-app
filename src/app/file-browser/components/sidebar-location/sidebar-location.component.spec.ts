import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
import { SidebarLocationComponent } from './sidebar-location.component';

describe('SidebarLocationComponent', () => {
	let component: SidebarLocationComponent;
	let fixture: ComponentFixture<SidebarLocationComponent>;

	const query = <T extends HTMLElement>(selector: string): T =>
		fixture.nativeElement.querySelector(selector);

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

		fixture.nativeElement.querySelectorAll('.sidebar-item-content')[1].click();

		expect(edits).toBe(1);
	});

	it('should ask for an edit on Enter over the map preview', () => {
		let edits = 0;
		component.editRequested.subscribe(() => (edits += 1));

		component.onEditEnterPress(new KeyboardEvent('keydown', { key: 'Enter' }));

		expect(edits).toBe(1);
	});

	it('should ignore keys other than Enter over the map preview', () => {
		let edits = 0;
		component.editRequested.subscribe(() => (edits += 1));

		component.onEditEnterPress(new KeyboardEvent('keydown', { key: 'a' }));

		expect(edits).toBe(0);
	});

	it('should ask for nothing at all when the item is read only', () => {
		component.canEdit = false;
		fixture.detectChanges();
		let edits = 0;
		component.editRequested.subscribe(() => (edits += 1));

		query('.sidebar-item-content').click();
		component.onEditEnterPress(new KeyboardEvent('keydown', { key: 'Enter' }));

		expect(edits).toBe(0);
	});
});
