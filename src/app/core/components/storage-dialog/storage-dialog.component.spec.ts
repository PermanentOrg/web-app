import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import { EventService } from '@shared/services/event/event.service';
import { StorageDialogComponent } from './storage-dialog.component';

@NgModule()
class DummyModule {}

class MockDialogRef {
	close(_?: any): void {
		// Mock close method
	}
}

describe('StorageDialogComponent', () => {
	let mockActivatedRoute;
	const paramMap = new BehaviorSubject(convertToParamMap({}));
	const queryParamMap = new BehaviorSubject(convertToParamMap({}));

	beforeEach(async () => {
		mockActivatedRoute = {
			paramMap: paramMap.asObservable(),
			queryParamMap: queryParamMap.asObservable(),
			snapshot: { fragment: null },
		};
		await MockBuilder(StorageDialogComponent, DummyModule)
			.provide({ provide: DialogRef, useClass: MockDialogRef })
			.provide({ provide: ActivatedRoute, useValue: mockActivatedRoute })
			.keep(EventService);
	});

	it('should exist', () => {
		const fixture = MockRender(StorageDialogComponent);

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should set the tab if the URL fragment matches a tab', () => {
		mockActivatedRoute.snapshot.fragment = 'promo';
		const fixture = MockRender(StorageDialogComponent);

		expect(fixture.point.componentInstance.activeTab).toBe('promo');
	});

	it('should not set the tab if the URL fragment is invalid', () => {
		mockActivatedRoute.snapshot.fragment = 'not-a-real-tab';
		const fixture = MockRender(StorageDialogComponent);

		expect(fixture.point.componentInstance.activeTab).not.toBe(
			mockActivatedRoute.snapshot.fragment,
		);
	});

	it('can close the dialog', () => {
		const fixture = MockRender(StorageDialogComponent);
		const instance = fixture.point.componentInstance;
		const dialogRef = TestBed.inject(DialogRef);
		const spy = spyOn(dialogRef, 'close');
		instance.onDoneClick();

		expect(spy).toHaveBeenCalled();
	});

	it('should emit an event when the promo tab is selected', async () => {
		const fixture = MockRender(StorageDialogComponent);
		const instance = fixture.point.componentInstance;
		const eventService = TestBed.inject(EventService);
		let eventCalled = false;
		eventService.addObserver({
			async update() {
				eventCalled = true;
			},
		});
		instance.setTab('promo');
		await fixture.whenStable();

		expect(eventCalled).toBeTrue();
	});
});
