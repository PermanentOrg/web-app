import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchiveVO } from '@models/index';
import { PendingArchiveComponent } from './pending-archive.component';

describe('PendingArchiveComponent', () => {
	let component: PendingArchiveComponent;
	let fixture: ComponentFixture<PendingArchiveComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PendingArchiveComponent],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PendingArchiveComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		component.archive = { fullName: 'John Doe' } as ArchiveVO;
		fixture.detectChanges();

		expect(component).toBeTruthy();
	});

	it('should display the archive fullName', () => {
		component.archive = new ArchiveVO({
			fullName: 'Test Archive',
			archiveId: 1,
			accessRole: 'access.role.viewer',
		});
		fixture.detectChanges();

		const fullNameElement = fixture.nativeElement.querySelector('.name b');

		expect(fullNameElement.textContent).toContain('Test Archive');
	});

	it('should handle undefined archive input gracefully', () => {
		component.archive = {} as ArchiveVO;
		fixture.detectChanges();

		const fullNameElement = fixture.nativeElement.querySelector('.name b');

		expect(fullNameElement.textContent).toBe('');
	});

	it('should emit acceptArchiveOutput event with the archive when acceptArchive is called', () => {
		const archiveData = new ArchiveVO({
			fullName: 'Test Archive',
			id: 1,
			role: 'access.role.viewer',
		});
		component.archive = archiveData;
		fixture.detectChanges();

		spyOn(component.acceptArchiveOutput, 'emit');

		component.acceptArchive(archiveData);

		expect(component.acceptArchiveOutput.emit).toHaveBeenCalledWith(
			archiveData,
		);
	});

	it('should display the correct role name based on the role input', () => {
		component.archive = new ArchiveVO({
			fullName: 'Test Archive',
			archiveId: 1,
			accessRole: 'access.role.editor',
		});
		fixture.detectChanges();

		const roleElement = fixture.nativeElement.querySelector('.role');

		expect(roleElement.textContent).toContain('Editor');
	});

	it('should map role key to role name correctly', () => {
		component.archive = new ArchiveVO({
			fullName: 'Test Archive',
			archiveId: 1,
			accessRole: 'access.role.editor',
		});
		fixture.detectChanges();

		const roleName = component.roles['access.role.contributor'];

		expect(roleName).toBe('Contributor');
	});
});
