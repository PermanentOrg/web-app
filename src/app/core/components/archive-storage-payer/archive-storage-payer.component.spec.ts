import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveStoragePayerComponent } from './archive-storage-payer.component';

describe('ArchiveStoragePayerComponent', () => {
	let component: ArchiveStoragePayerComponent;
	let fixture: ComponentFixture<ArchiveStoragePayerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ArchiveStoragePayerComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveStoragePayerComponent);
		({ componentInstance: component } = fixture);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
