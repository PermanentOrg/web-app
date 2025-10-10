import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicLoadingSpinnerComponent } from './basic-loading-spinner.component';

describe('BasicLoadingSpinnerComponent', () => {
	let component: BasicLoadingSpinnerComponent;
	let fixture: ComponentFixture<BasicLoadingSpinnerComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BasicLoadingSpinnerComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(BasicLoadingSpinnerComponent);
		({ componentInstance: component } = fixture);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
