import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LogoComponent } from '@auth/components/logo/logo.component';

describe('LogoComponent', () => {
	let component: LogoComponent;
	let fixture: ComponentFixture<LogoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LogoComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(LogoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
