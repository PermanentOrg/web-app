import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBuilder, ngMocks } from 'ng-mocks';
import { AuthRoutingModule } from '@auth/auth.routes';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
	let fixture: ComponentFixture<AuthComponent>;
	let instance: AuthComponent;

	beforeEach(() => MockBuilder(AuthComponent, AuthRoutingModule));

	beforeEach(() => {
		fixture = TestBed.createComponent(AuthComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(instance).toBeTruthy();
	});
});
