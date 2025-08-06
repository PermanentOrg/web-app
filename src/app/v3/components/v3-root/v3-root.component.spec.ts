import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V3RootComponent } from './v3-root.component';

describe('V3RootComponent', () => {
	let component: V3RootComponent;
	let fixture: ComponentFixture<V3RootComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [V3RootComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(V3RootComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
