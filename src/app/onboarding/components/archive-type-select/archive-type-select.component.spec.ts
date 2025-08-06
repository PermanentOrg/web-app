/* @format */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchiveTypeSelectComponent } from './archive-type-select.component';

describe('ArchiveTypeSelectComponent', () => {
	let component: ArchiveTypeSelectComponent;
	let fixture: ComponentFixture<ArchiveTypeSelectComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ArchiveTypeSelectComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveTypeSelectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
