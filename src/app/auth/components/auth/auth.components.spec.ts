import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { AuthRoutingModule } from '@auth/auth.routes';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
	let fixture: ComponentFixture<AuthComponent>;
	let instance: AuthComponent;

	beforeEach(async () => {
		await MockBuilder(AuthComponent, AuthRoutingModule);

		fixture = TestBed.createComponent(AuthComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(instance).toBeTruthy();
	});
});
