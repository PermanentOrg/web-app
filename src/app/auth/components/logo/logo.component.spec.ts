import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoComponent } from '@auth/components/logo/logo.component';

describe('LogoComponent', () => {
	let component: LogoComponent;
	let fixture: ComponentFixture<LogoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LogoComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(LogoComponent);
		({ componentInstance: component } = fixture);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
