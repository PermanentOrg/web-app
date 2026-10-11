import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DialogRef } from '@angular/cdk/dialog';
import { EventService } from '@shared/services/event/event.service';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
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
	let mockFeatureFlagService: {
		isEnabled: jasmine.Spy;
		fetchFromApi: jasmine.Spy;
	};
	const paramMap = new BehaviorSubject(convertToParamMap({}));
	const queryParamMap = new BehaviorSubject(convertToParamMap({}));

	beforeEach(async () => {
		mockActivatedRoute = {
			paramMap: paramMap.asObservable(),
			queryParamMap: queryParamMap.asObservable(),
			snapshot: { fragment: null },
		};
		mockFeatureFlagService = {
			isEnabled: jasmine.createSpy('isEnabled').and.returnValue(false),
			fetchFromApi: jasmine
				.createSpy('fetchFromApi')
				.and.returnValue(Promise.resolve()),
		};
		await MockBuilder(StorageDialogComponent, DummyModule)
			.provide({ provide: DialogRef, useClass: MockDialogRef })
			.provide({ provide: ActivatedRoute, useValue: mockActivatedRoute })
			.provide({
				provide: FeatureFlagService,
				useValue: mockFeatureFlagService,
			})
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

	it('defaults showPaymentIntentFlow to false and renders the legacy pledge form', async () => {
		const fixture = MockRender(StorageDialogComponent);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(fixture.point.componentInstance.showPaymentIntentFlow).toBe(false);
		expect(fixture.nativeElement.querySelector('pr-new-pledge')).not.toBeNull();

		expect(
			fixture.nativeElement.querySelector('pr-payment-intent-form'),
		).toBeNull();
	});

	it('shows the PaymentIntent form when the flag is enabled', async () => {
		mockFeatureFlagService.isEnabled.and.callFake(
			(flag: string) => flag === 'storage-purchase-payment-intent',
		);
		const fixture = MockRender(StorageDialogComponent);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(fixture.point.componentInstance.showPaymentIntentFlow).toBe(true);
		expect(
			fixture.nativeElement.querySelector('pr-payment-intent-form'),
		).not.toBeNull();

		expect(fixture.nativeElement.querySelector('pr-new-pledge')).toBeNull();
	});

	it('re-confirms the flag after ngOnInit even if the constructor read a stale value', async () => {
		// Simulates FeatureFlagService's fire-and-forget bootstrap fetch not
		// having resolved yet when the dialog's constructor runs.
		mockFeatureFlagService.isEnabled.and.returnValue(false);
		const fixture = MockRender(StorageDialogComponent);

		expect(fixture.point.componentInstance.showPaymentIntentFlow).toBe(false);

		mockFeatureFlagService.isEnabled.and.callFake(
			(flag: string) => flag === 'storage-purchase-payment-intent',
		);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(fixture.point.componentInstance.showPaymentIntentFlow).toBe(true);
		expect(mockFeatureFlagService.fetchFromApi).toHaveBeenCalled();
	});
});
