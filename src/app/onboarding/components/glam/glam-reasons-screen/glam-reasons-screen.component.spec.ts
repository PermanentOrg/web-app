import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reasons } from '../../../shared/onboarding-screen';
import { GlamReasonsScreenComponent } from './glam-reasons-screen.component';

describe('GlamReasonsScreenComponent', () => {
	let component: GlamReasonsScreenComponent;
	let fixture: ComponentFixture<GlamReasonsScreenComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GlamReasonsScreenComponent],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		spyOn(sessionStorage, 'getItem').and.callFake((key) => {
			const store = {
				reasons: JSON.stringify(['Mock Reason']),
			};
			return store[key] || null;
		});

		spyOn(sessionStorage, 'setItem').and.callFake((key, value) => {});

		fixture = TestBed.createComponent(GlamReasonsScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize reasons from shared/onboarding-screen', () => {
		expect(component.reasons).toEqual(reasons);
	});

	it('should initialize selectedReasons from sessionStorage', () => {
		expect(sessionStorage.getItem).toHaveBeenCalledWith('reasons');
		expect(component.selectedReasons).toEqual(['Mock Reason']);
	});

	it('should update sessionStorage when addReason is called', () => {
		const reason = 'Test Reason';

		component.addReason(reason);

		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'reasons',
			JSON.stringify(['Mock Reason', 'Test Reason']),
		);
	});

	it('should add reason to selectedReasons when addReason is called', () => {
		const reason = 'Test Reason';
		component.addReason(reason);

		expect(component.selectedReasons).toContain(reason);
	});

	it('should remove reason from selectedReasons when addReason is called twice', () => {
		const reason = 'Test Reason';
		component.addReason(reason);
		component.addReason(reason);

		expect(component.selectedReasons).not.toContain(reason);
	});

	it('should emit reasonsEmit with selectedReasons when finalizeArchive is called', () => {
		spyOn(component.reasonsEmit, 'emit');
		const reason = 'Test Reason';
		component.addReason(reason);
		component.finalizeArchive();

		expect(component.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'finalize',
			reasons: ['Mock Reason', reason],
		});
	});

	it('should emit reasonsEmit with selectedReasons when backToGoals is called', () => {
		spyOn(component.reasonsEmit, 'emit');
		const reason = 'Test Reason';
		component.addReason(reason);
		component.backToGoals();

		expect(component.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'goals',
			reasons: ['Mock Reason', reason],
		});
	});

	it('should clear selectedReasons and update sessionStorage when skipStep is called', () => {
		expect(component.selectedReasons).toEqual(['Mock Reason']);

		component.skipStep();

		expect(component.selectedReasons).toEqual([]);
		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'reasons',
			JSON.stringify([]),
		);
	});

	it('should emit reasonOutput with empty reasons when skipStep is called', () => {
		spyOn(component.reasonsEmit, 'emit');

		component.skipStep();

		expect(component.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'finalize',
			reasons: [],
		});
	});
});
