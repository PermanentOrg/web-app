/*
These tests were adapted from the tests of the ngx-route-history package:
https://github.com/andrewatwood/ngx-route-history/blob/master/tests/services/route-history.service.spec.ts
*/
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RouteHistoryService } from './route-history.service';

@Component({
	selector: 'pr-dummy',
	template: 'test',
	standalone: false,
})
class DummyComponent {}

const testRoutes: Routes = [
	{ path: '', component: DummyComponent },
	{ path: 'home', component: DummyComponent },
	{ path: 'profile', component: DummyComponent },
];

describe('RouteHistoryService', () => {
	let service: RouteHistoryService;
	let router: Router;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule.withRoutes(testRoutes)],
		});
		service = TestBed.inject(RouteHistoryService);
		router = TestBed.inject(Router);
	});

	function expectRoutesToBeUndefined(): void {
		expect(service.currentRoute).toBeUndefined();
		expect(service.previousRoute).toBeUndefined();
	}

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should provide the current route after navigation', async () => {
		expectRoutesToBeUndefined();
		await router.navigate(['/home']);

		expect(service.currentRoute).toEqual('/home');
		expect(service.previousRoute).toBeUndefined();
	});

	it('should provide the previous route after second navigation', async () => {
		expectRoutesToBeUndefined();
		await router.navigate(['/home']);
		await router.navigate(['/profile']);

		expect(service.currentRoute).toEqual('/profile');
		expect(service.previousRoute).toEqual('/home');
	});

	it('should destroy', async () => {
		service.ngOnDestroy();
		await router.navigate(['/home']);
		await router.navigate(['/profile']);
		expectRoutesToBeUndefined();
	});

	it('should not record history on popstate', async () => {
		await router.navigate(['/home']);
		await router.navigate(['/profile']);
		(service as any).popstate = true;
		await router.navigate(['/home']);

		expect(service.previousRoute).toBeUndefined();
	});
});
