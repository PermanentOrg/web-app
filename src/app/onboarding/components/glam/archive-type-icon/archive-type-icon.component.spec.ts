import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveTypeIconComponent } from './archive-type-icon.component';

describe('ArchiveTypeIconComponent', () => {
	let component: ArchiveTypeIconComponent;
	let fixture: ComponentFixture<ArchiveTypeIconComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ArchiveTypeIconComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveTypeIconComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
